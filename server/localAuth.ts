import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import type { Express, RequestHandler } from "express";
// Note: For simplicity, we're not using bcrypt for demo passwords
import { storage } from "./storage";
import type { User } from "@shared/schema";

// Simple user credentials for local development
const LOCAL_USERS = [
  {
    id: "1",
    email: "test@example.com",
    username: "testuser",
    password: "password123",
    firstName: "Test",
    lastName: "User",
    profileImageUrl: null
  },
  {
    id: "2", 
    email: "kowsika@example.com",
    username: "kowsika",
    password: "testpass",
    firstName: "Kowsika",
    lastName: "User",
    profileImageUrl: null
  }
];

export function getLocalSession() {
  return session({
    secret: process.env.SESSION_SECRET || 'local-dev-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // false for local development
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  });
}

export async function setupLocalAuth(app: Express) {
  app.use(getLocalSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Local Strategy
  passport.use(new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    async (email, password, done) => {
      try {
        const user = LOCAL_USERS.find(u => u.email === email || u.username === email);
        
        if (!user || user.password !== password) {
          return done(null, false, { message: 'Invalid credentials' });
        }

        // Ensure user exists in database
        await storage.upsertUser({
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
        });

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  ));

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Local auth routes
  app.post('/api/login', passport.authenticate('local'), (req, res) => {
    res.json({ success: true, user: req.user });
  });

  app.post('/api/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.json({ success: true });
    });
  });

  // Login page route
  app.get('/api/login', (req, res) => {
    if (req.isAuthenticated()) {
      return res.redirect('/');
    }
    
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Login - QuickLoan AI</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 400px; margin: 100px auto; padding: 20px; }
          .form-group { margin-bottom: 15px; }
          label { display: block; margin-bottom: 5px; }
          input { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
          button { width: 100%; padding: 10px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
          button:hover { background: #0056b3; }
          .demo-users { background: #f8f9fa; padding: 15px; border-radius: 4px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <h2>Login to QuickLoan AI</h2>
        <form method="POST" action="/api/login">
          <div class="form-group">
            <label for="email">Email/Username:</label>
            <input type="text" id="email" name="email" required>
          </div>
          <div class="form-group">
            <label for="password">Password:</label>
            <input type="password" id="password" name="password" required>
          </div>
          <button type="submit">Login</button>
        </form>
        
        <div class="demo-users">
          <h4>Demo Users:</h4>
          <p><strong>User 1:</strong> test@example.com / password123</p>
          <p><strong>User 2:</strong> kowsika@example.com / testpass</p>
        </div>
      </body>
      </html>
    `);
  });
}

export const isLocalAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  
  res.status(401).json({ message: "Unauthorized" });
};