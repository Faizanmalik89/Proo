import {
  User, InsertUser,
  Category, InsertCategory,
  Blog, InsertBlog,
  Video, InsertVideo,
  Ad, InsertAd,
  Setting, InsertSetting,
  Term, InsertTerm
} from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

// Define the storage interface
export interface IStorage {
  // Session store
  sessionStore: session.SessionStore;

  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  
  // Categories
  getCategory(id: number): Promise<Category | undefined>;
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  
  // Blogs
  getBlog(id: number): Promise<Blog | undefined>;
  getBlogs(filters?: { categoryId?: number, published?: boolean }): Promise<Blog[]>;
  createBlog(blog: InsertBlog): Promise<Blog>;
  updateBlog(id: number, blog: Partial<InsertBlog>): Promise<Blog | undefined>;
  deleteBlog(id: number): Promise<boolean>;
  
  // Videos
  getVideo(id: number): Promise<Video | undefined>;
  getVideos(filters?: { categoryId?: number, published?: boolean }): Promise<Video[]>;
  createVideo(video: InsertVideo): Promise<Video>;
  updateVideo(id: number, video: Partial<InsertVideo>): Promise<Video | undefined>;
  deleteVideo(id: number): Promise<boolean>;
  
  // Ads
  getAd(id: number): Promise<Ad | undefined>;
  getAds(active?: boolean): Promise<Ad[]>;
  createAd(ad: InsertAd): Promise<Ad>;
  updateAd(id: number, ad: Partial<InsertAd>): Promise<Ad | undefined>;
  deleteAd(id: number): Promise<boolean>;
  
  // Settings
  getSetting(key: string): Promise<Setting | undefined>;
  getSettings(): Promise<Setting[]>;
  updateSetting(key: string, value: string): Promise<Setting | undefined>;
  
  // Terms
  getTerm(id: number): Promise<Term | undefined>;
  getTermByType(type: string): Promise<Term | undefined>;
  getTerms(): Promise<Term[]>;
  createTerm(term: InsertTerm): Promise<Term>;
  updateTerm(id: number, term: Partial<InsertTerm>): Promise<Term | undefined>;
  deleteTerm(id: number): Promise<boolean>;

  // Stats methods
  getStats(): Promise<{
    users: number;
    blogs: number;
    videos: number;
    activeAds: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private categories: Map<number, Category> = new Map();
  private blogs: Map<number, Blog> = new Map();
  private videos: Map<number, Video> = new Map();
  private ads: Map<number, Ad> = new Map();
  private settings: Map<string, Setting> = new Map();
  private terms: Map<number, Term> = new Map();

  private userIdCounter = 1;
  private categoryIdCounter = 1;
  private blogIdCounter = 1;
  private videoIdCounter = 1;
  private adIdCounter = 1;
  private termIdCounter = 1;
  
  readonly sessionStore: session.SessionStore;

  constructor() {
    const MemoryStore = createMemoryStore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
    
    // Since seedData is now async, we need to call it asynchronously
    this.initializeData();
  }
  
  private async initializeData() {
    try {
      await this.seedData();
      console.log("Database seeded successfully");
    } catch (error) {
      console.error("Error seeding database:", error);
    }
  }

  private async seedData() {
    // Import the hashPassword function from auth.ts
    const { hashPassword } = await import('./auth');
    
    // Seed initial admin user with hashed password
    this.createUser({
      username: 'admin',
      password: await hashPassword('adminpassword'),
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      isAdmin: true
    });
    
    // Seed categories
    const tech = this.createCategory({ name: 'Technology', description: 'Tech-related content' });
    const health = this.createCategory({ name: 'Health & Wellness', description: 'Health and wellness content' });
    const business = this.createCategory({ name: 'Business', description: 'Business content' });
    const design = this.createCategory({ name: 'Design', description: 'Design content' });
    
    // Seed initial terms
    this.createTerm({
      title: 'Terms of Service',
      content: 'These are the terms of service...',
      type: 'terms-of-service',
      active: true
    });
    
    this.createTerm({
      title: 'Privacy Policy',
      content: 'This is our privacy policy...',
      type: 'privacy-policy',
      active: true
    });
    
    // Initial site settings
    this.settings.set('site_title', {
      id: 1,
      key: 'site_title',
      value: 'MediaHub',
      description: 'Site title',
      updatedAt: new Date()
    });
    
    this.settings.set('site_description', {
      id: 2,
      key: 'site_description',
      value: 'Your one-stop platform for videos, blogs, and digital content',
      description: 'Site description',
      updatedAt: new Date()
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const newUser: User = {
      ...user,
      id,
      createdAt: new Date()
    };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;

    const updatedUser: User = { ...existingUser, ...user };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }

  // Categories
  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.categoryIdCounter++;
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const existingCategory = this.categories.get(id);
    if (!existingCategory) return undefined;

    const updatedCategory: Category = { ...existingCategory, ...category };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<boolean> {
    return this.categories.delete(id);
  }

  // Blogs
  async getBlog(id: number): Promise<Blog | undefined> {
    return this.blogs.get(id);
  }

  async getBlogs(filters?: { categoryId?: number, published?: boolean }): Promise<Blog[]> {
    let blogs = Array.from(this.blogs.values());

    if (filters) {
      if (filters.categoryId !== undefined) {
        blogs = blogs.filter(blog => blog.categoryId === filters.categoryId);
      }
      if (filters.published !== undefined) {
        blogs = blogs.filter(blog => blog.published === filters.published);
      }
    }

    return blogs;
  }

  async createBlog(blog: InsertBlog): Promise<Blog> {
    const id = this.blogIdCounter++;
    const now = new Date();
    const newBlog: Blog = {
      ...blog,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.blogs.set(id, newBlog);
    return newBlog;
  }

  async updateBlog(id: number, blog: Partial<InsertBlog>): Promise<Blog | undefined> {
    const existingBlog = this.blogs.get(id);
    if (!existingBlog) return undefined;

    const updatedBlog: Blog = {
      ...existingBlog,
      ...blog,
      updatedAt: new Date()
    };
    this.blogs.set(id, updatedBlog);
    return updatedBlog;
  }

  async deleteBlog(id: number): Promise<boolean> {
    return this.blogs.delete(id);
  }

  // Videos
  async getVideo(id: number): Promise<Video | undefined> {
    return this.videos.get(id);
  }

  async getVideos(filters?: { categoryId?: number, published?: boolean }): Promise<Video[]> {
    let videos = Array.from(this.videos.values());

    if (filters) {
      if (filters.categoryId !== undefined) {
        videos = videos.filter(video => video.categoryId === filters.categoryId);
      }
      if (filters.published !== undefined) {
        videos = videos.filter(video => video.published === filters.published);
      }
    }

    return videos;
  }

  async createVideo(video: InsertVideo): Promise<Video> {
    const id = this.videoIdCounter++;
    const now = new Date();
    const newVideo: Video = {
      ...video,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.videos.set(id, newVideo);
    return newVideo;
  }

  async updateVideo(id: number, video: Partial<InsertVideo>): Promise<Video | undefined> {
    const existingVideo = this.videos.get(id);
    if (!existingVideo) return undefined;

    const updatedVideo: Video = {
      ...existingVideo,
      ...video,
      updatedAt: new Date()
    };
    this.videos.set(id, updatedVideo);
    return updatedVideo;
  }

  async deleteVideo(id: number): Promise<boolean> {
    return this.videos.delete(id);
  }

  // Ads
  async getAd(id: number): Promise<Ad | undefined> {
    return this.ads.get(id);
  }

  async getAds(active?: boolean): Promise<Ad[]> {
    let ads = Array.from(this.ads.values());

    if (active !== undefined) {
      ads = ads.filter(ad => ad.active === active);
    }

    return ads;
  }

  async createAd(ad: InsertAd): Promise<Ad> {
    const id = this.adIdCounter++;
    const now = new Date();
    const newAd: Ad = {
      ...ad,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.ads.set(id, newAd);
    return newAd;
  }

  async updateAd(id: number, ad: Partial<InsertAd>): Promise<Ad | undefined> {
    const existingAd = this.ads.get(id);
    if (!existingAd) return undefined;

    const updatedAd: Ad = {
      ...existingAd,
      ...ad,
      updatedAt: new Date()
    };
    this.ads.set(id, updatedAd);
    return updatedAd;
  }

  async deleteAd(id: number): Promise<boolean> {
    return this.ads.delete(id);
  }

  // Settings
  async getSetting(key: string): Promise<Setting | undefined> {
    return this.settings.get(key);
  }

  async getSettings(): Promise<Setting[]> {
    return Array.from(this.settings.values());
  }

  async updateSetting(key: string, value: string): Promise<Setting | undefined> {
    const existingSetting = this.settings.get(key);
    if (!existingSetting) return undefined;

    const updatedSetting: Setting = {
      ...existingSetting,
      value,
      updatedAt: new Date()
    };
    this.settings.set(key, updatedSetting);
    return updatedSetting;
  }

  // Terms
  async getTerm(id: number): Promise<Term | undefined> {
    return this.terms.get(id);
  }

  async getTermByType(type: string): Promise<Term | undefined> {
    return Array.from(this.terms.values()).find(term => term.type === type && term.active);
  }

  async getTerms(): Promise<Term[]> {
    return Array.from(this.terms.values());
  }

  async createTerm(term: InsertTerm): Promise<Term> {
    const id = this.termIdCounter++;
    const newTerm: Term = {
      ...term,
      id,
      updatedAt: new Date()
    };
    this.terms.set(id, newTerm);
    return newTerm;
  }

  async updateTerm(id: number, term: Partial<InsertTerm>): Promise<Term | undefined> {
    const existingTerm = this.terms.get(id);
    if (!existingTerm) return undefined;

    const updatedTerm: Term = {
      ...existingTerm,
      ...term,
      updatedAt: new Date()
    };
    this.terms.set(id, updatedTerm);
    return updatedTerm;
  }

  async deleteTerm(id: number): Promise<boolean> {
    return this.terms.delete(id);
  }

  // Stats methods
  async getStats(): Promise<{ users: number; blogs: number; videos: number; activeAds: number; }> {
    const activeAds = Array.from(this.ads.values()).filter(ad => ad.active).length;
    return {
      users: this.users.size,
      blogs: this.blogs.size,
      videos: this.videos.size,
      activeAds
    };
  }
}

export const storage = new MemStorage();
