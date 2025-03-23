import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import express from "express";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import multer from "multer";
import path from "path";
import fs from "fs";
import { insertBlogSchema, insertVideoSchema, insertAdSchema, insertCategorySchema, insertTermSchema } from "@shared/schema";

// Set up multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.resolve(process.cwd(), 'uploads');
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  })
});

// Middleware to check if user is authenticated and is an admin
function isAdmin(req: Request, res: Response, next: Function) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);

  // Serve uploaded files
  app.use('/api/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

  // API routes for dashboard stats
  app.get('/api/stats', isAdmin, async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to get stats", error: (error as Error).message });
    }
  });

  // Categories API
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to get categories", error: (error as Error).message });
    }
  });

  app.post('/api/categories', isAdmin, async (req, res) => {
    try {
      const validationResult = insertCategorySchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid category data", errors: validationResult.error.errors });
      }

      const category = await storage.createCategory(validationResult.data);
      res.status(201).json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to create category", error: (error as Error).message });
    }
  });

  app.put('/api/categories/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const category = await storage.updateCategory(id, req.body);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to update category", error: (error as Error).message });
    }
  });

  app.delete('/api/categories/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteCategory(id);
      if (!success) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Failed to delete category", error: (error as Error).message });
    }
  });

  // Blog API
  app.get('/api/blogs', async (req, res) => {
    try {
      const filters: { categoryId?: number, published?: boolean } = {};
      
      if (req.query.categoryId) {
        filters.categoryId = parseInt(req.query.categoryId as string);
      }
      
      if (req.query.published) {
        filters.published = req.query.published === 'true';
      } else if (!req.isAuthenticated() || !req.user.isAdmin) {
        // If not admin and published filter not explicitly set, only show published
        filters.published = true;
      }
      
      const blogs = await storage.getBlogs(filters);
      res.json(blogs);
    } catch (error) {
      res.status(500).json({ message: "Failed to get blogs", error: (error as Error).message });
    }
  });

  app.get('/api/blogs/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const blog = await storage.getBlog(id);
      
      if (!blog) {
        return res.status(404).json({ message: "Blog not found" });
      }
      
      // Only allow access to unpublished blogs for admins
      if (!blog.published && (!req.isAuthenticated() || !req.user.isAdmin)) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(blog);
    } catch (error) {
      res.status(500).json({ message: "Failed to get blog", error: (error as Error).message });
    }
  });

  app.post('/api/blogs', isAdmin, upload.single('featuredImage'), async (req, res) => {
    try {
      const blogData = req.body;
      
      // Convert categoryId to number
      if (blogData.categoryId) {
        blogData.categoryId = parseInt(blogData.categoryId);
      }
      
      // Set author ID from authenticated user
      blogData.authorId = req.user.id;
      
      // Convert published string to boolean if needed
      if (typeof blogData.published === 'string') {
        blogData.published = blogData.published === 'true';
      }
      
      // Add featured image path if uploaded
      if (req.file) {
        blogData.featuredImage = `/api/uploads/${req.file.filename}`;
      }
      
      const validationResult = insertBlogSchema.safeParse(blogData);
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid blog data", errors: validationResult.error.errors });
      }

      const blog = await storage.createBlog(validationResult.data);
      res.status(201).json(blog);
    } catch (error) {
      res.status(500).json({ message: "Failed to create blog", error: (error as Error).message });
    }
  });

  app.put('/api/blogs/:id', isAdmin, upload.single('featuredImage'), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const blogData = req.body;
      
      // Convert categoryId to number
      if (blogData.categoryId) {
        blogData.categoryId = parseInt(blogData.categoryId);
      }
      
      // Convert published string to boolean if needed
      if (typeof blogData.published === 'string') {
        blogData.published = blogData.published === 'true';
      }
      
      // Add featured image path if uploaded
      if (req.file) {
        blogData.featuredImage = `/api/uploads/${req.file.filename}`;
      }
      
      const blog = await storage.updateBlog(id, blogData);
      if (!blog) {
        return res.status(404).json({ message: "Blog not found" });
      }
      res.json(blog);
    } catch (error) {
      res.status(500).json({ message: "Failed to update blog", error: (error as Error).message });
    }
  });

  app.delete('/api/blogs/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteBlog(id);
      if (!success) {
        return res.status(404).json({ message: "Blog not found" });
      }
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Failed to delete blog", error: (error as Error).message });
    }
  });

  // Video API
  app.get('/api/videos', async (req, res) => {
    try {
      const filters: { categoryId?: number, published?: boolean } = {};
      
      if (req.query.categoryId) {
        filters.categoryId = parseInt(req.query.categoryId as string);
      }
      
      if (req.query.published) {
        filters.published = req.query.published === 'true';
      } else if (!req.isAuthenticated() || !req.user.isAdmin) {
        // If not admin and published filter not explicitly set, only show published
        filters.published = true;
      }
      
      const videos = await storage.getVideos(filters);
      res.json(videos);
    } catch (error) {
      res.status(500).json({ message: "Failed to get videos", error: (error as Error).message });
    }
  });

  app.get('/api/videos/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const video = await storage.getVideo(id);
      
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      
      // Only allow access to unpublished videos for admins
      if (!video.published && (!req.isAuthenticated() || !req.user.isAdmin)) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(video);
    } catch (error) {
      res.status(500).json({ message: "Failed to get video", error: (error as Error).message });
    }
  });

  app.post('/api/videos', isAdmin, upload.fields([
    { name: 'video', maxCount: 1 }, 
    { name: 'thumbnail', maxCount: 1 }
  ]), async (req, res) => {
    try {
      const videoData = req.body;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      // Convert categoryId to number
      if (videoData.categoryId) {
        videoData.categoryId = parseInt(videoData.categoryId);
      }
      
      // Set author ID from authenticated user
      videoData.authorId = req.user.id;
      
      // Convert published string to boolean if needed
      if (typeof videoData.published === 'string') {
        videoData.published = videoData.published === 'true';
      }
      
      // Convert duration to number if provided
      if (videoData.duration) {
        videoData.duration = parseInt(videoData.duration);
      }
      
      // Add video file path if uploaded
      if (files.video && files.video[0]) {
        videoData.videoUrl = `/api/uploads/${files.video[0].filename}`;
      }
      
      // Add thumbnail path if uploaded
      if (files.thumbnail && files.thumbnail[0]) {
        videoData.thumbnailUrl = `/api/uploads/${files.thumbnail[0].filename}`;
      }
      
      const validationResult = insertVideoSchema.safeParse(videoData);
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid video data", errors: validationResult.error.errors });
      }

      const video = await storage.createVideo(validationResult.data);
      res.status(201).json(video);
    } catch (error) {
      res.status(500).json({ message: "Failed to create video", error: (error as Error).message });
    }
  });

  app.put('/api/videos/:id', isAdmin, upload.fields([
    { name: 'video', maxCount: 1 }, 
    { name: 'thumbnail', maxCount: 1 }
  ]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const videoData = req.body;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      
      // Convert categoryId to number
      if (videoData.categoryId) {
        videoData.categoryId = parseInt(videoData.categoryId);
      }
      
      // Convert published string to boolean if needed
      if (typeof videoData.published === 'string') {
        videoData.published = videoData.published === 'true';
      }
      
      // Convert duration to number if provided
      if (videoData.duration) {
        videoData.duration = parseInt(videoData.duration);
      }
      
      // Add video file path if uploaded
      if (files?.video && files.video[0]) {
        videoData.videoUrl = `/api/uploads/${files.video[0].filename}`;
      }
      
      // Add thumbnail path if uploaded
      if (files?.thumbnail && files.thumbnail[0]) {
        videoData.thumbnailUrl = `/api/uploads/${files.thumbnail[0].filename}`;
      }
      
      const video = await storage.updateVideo(id, videoData);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      res.json(video);
    } catch (error) {
      res.status(500).json({ message: "Failed to update video", error: (error as Error).message });
    }
  });

  app.delete('/api/videos/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteVideo(id);
      if (!success) {
        return res.status(404).json({ message: "Video not found" });
      }
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Failed to delete video", error: (error as Error).message });
    }
  });

  // Ads API
  app.get('/api/ads', async (req, res) => {
    try {
      const active = req.query.active ? req.query.active === 'true' : undefined;
      const ads = await storage.getAds(active);
      res.json(ads);
    } catch (error) {
      res.status(500).json({ message: "Failed to get ads", error: (error as Error).message });
    }
  });

  app.get('/api/ads/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const ad = await storage.getAd(id);
      if (!ad) {
        return res.status(404).json({ message: "Ad not found" });
      }
      res.json(ad);
    } catch (error) {
      res.status(500).json({ message: "Failed to get ad", error: (error as Error).message });
    }
  });

  app.post('/api/ads', isAdmin, upload.single('image'), async (req, res) => {
    try {
      const adData = req.body;
      
      // Convert active string to boolean if needed
      if (typeof adData.active === 'string') {
        adData.active = adData.active === 'true';
      }
      
      // Add image path if uploaded
      if (req.file) {
        adData.imageUrl = `/api/uploads/${req.file.filename}`;
      }
      
      // Parse date strings to Date objects
      if (adData.startDate) {
        adData.startDate = new Date(adData.startDate);
      }
      
      if (adData.endDate) {
        adData.endDate = new Date(adData.endDate);
      }
      
      const validationResult = insertAdSchema.safeParse(adData);
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid ad data", errors: validationResult.error.errors });
      }

      const ad = await storage.createAd(validationResult.data);
      res.status(201).json(ad);
    } catch (error) {
      res.status(500).json({ message: "Failed to create ad", error: (error as Error).message });
    }
  });

  app.put('/api/ads/:id', isAdmin, upload.single('image'), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const adData = req.body;
      
      // Convert active string to boolean if needed
      if (typeof adData.active === 'string') {
        adData.active = adData.active === 'true';
      }
      
      // Add image path if uploaded
      if (req.file) {
        adData.imageUrl = `/api/uploads/${req.file.filename}`;
      }
      
      // Parse date strings to Date objects
      if (adData.startDate) {
        adData.startDate = new Date(adData.startDate);
      }
      
      if (adData.endDate) {
        adData.endDate = new Date(adData.endDate);
      }
      
      const ad = await storage.updateAd(id, adData);
      if (!ad) {
        return res.status(404).json({ message: "Ad not found" });
      }
      res.json(ad);
    } catch (error) {
      res.status(500).json({ message: "Failed to update ad", error: (error as Error).message });
    }
  });

  app.delete('/api/ads/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteAd(id);
      if (!success) {
        return res.status(404).json({ message: "Ad not found" });
      }
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Failed to delete ad", error: (error as Error).message });
    }
  });

  // Settings API
  app.get('/api/settings', async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to get settings", error: (error as Error).message });
    }
  });

  app.get('/api/settings/:key', async (req, res) => {
    try {
      const key = req.params.key;
      const setting = await storage.getSetting(key);
      if (!setting) {
        return res.status(404).json({ message: "Setting not found" });
      }
      res.json(setting);
    } catch (error) {
      res.status(500).json({ message: "Failed to get setting", error: (error as Error).message });
    }
  });

  app.put('/api/settings/:key', isAdmin, async (req, res) => {
    try {
      const key = req.params.key;
      const { value } = req.body;
      if (!value) {
        return res.status(400).json({ message: "Value is required" });
      }
      
      const setting = await storage.updateSetting(key, value);
      if (!setting) {
        return res.status(404).json({ message: "Setting not found" });
      }
      res.json(setting);
    } catch (error) {
      res.status(500).json({ message: "Failed to update setting", error: (error as Error).message });
    }
  });

  // Terms API
  app.get('/api/terms', async (req, res) => {
    try {
      const terms = await storage.getTerms();
      res.json(terms);
    } catch (error) {
      res.status(500).json({ message: "Failed to get terms", error: (error as Error).message });
    }
  });

  app.get('/api/terms/:type', async (req, res) => {
    try {
      const type = req.params.type;
      const term = await storage.getTermByType(type);
      if (!term) {
        return res.status(404).json({ message: "Term not found" });
      }
      res.json(term);
    } catch (error) {
      res.status(500).json({ message: "Failed to get term", error: (error as Error).message });
    }
  });

  app.post('/api/terms', isAdmin, async (req, res) => {
    try {
      const validationResult = insertTermSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid term data", errors: validationResult.error.errors });
      }

      const term = await storage.createTerm(validationResult.data);
      res.status(201).json(term);
    } catch (error) {
      res.status(500).json({ message: "Failed to create term", error: (error as Error).message });
    }
  });

  app.put('/api/terms/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const term = await storage.updateTerm(id, req.body);
      if (!term) {
        return res.status(404).json({ message: "Term not found" });
      }
      res.json(term);
    } catch (error) {
      res.status(500).json({ message: "Failed to update term", error: (error as Error).message });
    }
  });

  app.delete('/api/terms/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteTerm(id);
      if (!success) {
        return res.status(404).json({ message: "Term not found" });
      }
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Failed to delete term", error: (error as Error).message });
    }
  });

  // Users API (admin only)
  app.get('/api/users', isAdmin, async (req, res) => {
    try {
      const users = await storage.getUsers();
      // Remove passwords from response
      const sanitizedUsers = users.map(({ password, ...user }) => user);
      res.json(sanitizedUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to get users", error: (error as Error).message });
    }
  });

  app.get('/api/users/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      // Remove password from response
      const { password, ...userResponse } = user;
      res.json(userResponse);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user", error: (error as Error).message });
    }
  });

  app.put('/api/users/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userData = req.body;
      
      // Don't allow changing username through this endpoint
      delete userData.username;
      
      // Hash password if provided
      if (userData.password) {
        userData.password = await hashPassword(userData.password);
      }
      
      const user = await storage.updateUser(id, userData);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userResponse } = user;
      res.json(userResponse);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user", error: (error as Error).message });
    }
  });

  app.delete('/api/users/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Don't allow deleting yourself
      if (id === req.user.id) {
        return res.status(400).json({ message: "Cannot delete yourself" });
      }
      
      const success = await storage.deleteUser(id);
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user", error: (error as Error).message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// This is needed for multer
import express from "express";
