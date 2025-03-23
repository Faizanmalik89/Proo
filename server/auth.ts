import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { InsertUser } from "@shared/schema";

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "mediahub-secret-key",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: 'lax'
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use('local', new LocalStrategy(async (username, password, done) => {
    const user = await storage.getUserByUsername(username);
    if (!user || !(await comparePasswords(password, user.password))) {
      return done(null, false, { message: "Invalid username or password" });
    } else {
      return done(null, user);
    }
  }));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // User authentication routes
  app.post("/api/auth/register", async (req, res, next) => {
    try {
      const { username, email, password, firstName, lastName } = req.body;
      
      // Check if user already exists
      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      // Create a new user
      const hashedPassword = await hashPassword(password);
      const userData: InsertUser = {
        username,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        isAdmin: false
      };
      
      const newUser = await storage.createUser(userData);
      
      // Remove password before sending response
      const { password: _, ...userResponse } = newUser;
      
      // Log the user in
      req.login(newUser, (err) => {
        if (err) return next(err);
        return res.status(201).json(userResponse);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info?.message || "Invalid credentials" });
      
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Remove password before sending response
        const { password, ...userResponse } = user;
        return res.json(userResponse);
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/auth/user", (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    // Remove password before sending response
    const { password, ...userResponse } = req.user;
    res.json(userResponse);
  });

  // Admin authentication routes (using the same passport strategy but checking isAdmin)
  app.post("/api/admin/login", (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info?.message || "Invalid credentials" });
      if (!user.isAdmin) return res.status(403).json({ message: "Access denied" });
      
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Remove password before sending response
        const { password, ...userResponse } = user;
        return res.json(userResponse);
      });
    })(req, res, next);
  });

  app.get("/api/admin/user", (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    if (!req.user.isAdmin) return res.status(403).json({ message: "Access denied" });
    
    // Remove password before sending response
    const { password, ...userResponse } = req.user;
    res.json(userResponse);
  });
}
