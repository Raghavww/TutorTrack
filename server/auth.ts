import bcrypt from "bcryptjs";
import session from "express-session";
import type { Express, RequestHandler, Request, Response, NextFunction } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

const SALT_ROUNDS = 12;

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET || "zhk-tuition-secret-key-2024",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function seedAdminUser() {
  const adminEmail = "info@zhktuition.com";
  const adminPassword = "Zaydali1";
  
  try {
    const existingUser = await storage.getUserByEmail(adminEmail);
    
    if (!existingUser) {
      const passwordHash = await hashPassword(adminPassword);
      await storage.createUserWithPassword({
        email: adminEmail,
        passwordHash,
        firstName: "Admin",
        lastName: "ZHK",
        role: "admin",
      });
      console.log("Admin user created successfully");
    } else if (!existingUser.passwordHash) {
      const passwordHash = await hashPassword(adminPassword);
      await storage.updateUserPassword(existingUser.id, passwordHash);
      console.log("Admin user password updated");
    } else {
      console.log("Admin user already exists");
    }
  } catch (error) {
    console.error("Failed to seed admin user:", error);
  }
}

export function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  app.post("/api/login", async (req: Request, res: Response) => {
    try {
      const { email, password, role } = req.body;

      if (!email || !password || !role) {
        return res.status(400).json({ message: "Email, password, and role are required" });
      }

      const user = await storage.getUserByEmail(email);

      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      if (!user.passwordHash) {
        return res.status(401).json({ message: "Password not set for this account" });
      }

      if (!user.isActive) {
        return res.status(401).json({ message: "Account is disabled" });
      }

      // Allow additional_staff to log in through tutor login flow
      const roleMatches = user.role === role || 
        (role === "tutor" && (user.role === "tutor" || user.role === "admin" || user.role === "additional_staff"));
      
      if (!roleMatches) {
        return res.status(403).json({ message: `This account does not have ${role} access` });
      }

      const isValidPassword = await verifyPassword(password, user.passwordHash);

      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      req.session.userId = user.id;
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ message: "Login failed" });
        }
        res.json({
          message: "Login successful",
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          },
        });
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out successfully" });
    });
  });

  // Also support GET for logout (for direct browser navigation)
  app.get("/api/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie("connect.sid");
      res.redirect("/");
    });
  });

  app.get("/api/auth/user", async (req: Request, res: Response) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUser(req.session.userId);

      if (!user || !user.isActive) {
        req.session.destroy(() => {});
        return res.status(401).json({ message: "User not found or inactive" });
      }

      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        profileImageUrl: user.profileImageUrl,
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Admin: Create tutor account
  app.post("/api/admin/create-tutor", async (req: Request, res: Response) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const admin = await storage.getUser(req.session.userId);
      if (!admin || admin.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { email, password, firstName, lastName, role, description, startYear, phone, emergencyContactName, emergencyContactPhone } = req.body;

      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ message: "Email, password, first name, and last name are required" });
      }

      // Validate role if provided
      const validRoles = ["admin", "tutor", "additional_staff"];
      const userRole = role && validRoles.includes(role) ? role : "tutor";

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "A user with this email already exists" });
      }

      const passwordHash = await hashPassword(password);
      const user = await storage.createUserWithPassword({
        email,
        passwordHash,
        firstName,
        lastName,
        role: userRole,
        description: description || null,
        startYear: startYear || null,
        phone: phone || null,
        emergencyContactName: emergencyContactName || null,
        emergencyContactPhone: emergencyContactPhone || null,
      });

      res.status(201).json({
        message: "Tutor account created successfully",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Create tutor error:", error);
      res.status(500).json({ message: "Failed to create tutor account" });
    }
  });

  // Admin: Create parent account
  app.post("/api/admin/create-parent", async (req: Request, res: Response) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const admin = await storage.getUser(req.session.userId);
      if (!admin || admin.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { email, password, firstName, lastName } = req.body;

      if (!email || !password || !firstName) {
        return res.status(400).json({ message: "Email, password, and first name are required" });
      }

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "A user with this email already exists" });
      }

      const passwordHash = await hashPassword(password);
      const user = await storage.createUserWithPassword({
        email,
        passwordHash,
        firstName,
        lastName,
        role: "parent",
      });

      res.status(201).json({
        message: "Parent account created successfully",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Create parent error:", error);
      res.status(500).json({ message: "Failed to create parent account" });
    }
  });

  // Change password (for logged-in users)
  app.post("/api/auth/change-password", async (req: Request, res: Response) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters" });
      }

      if (!user.passwordHash) {
        return res.status(400).json({ message: "No password set for this account" });
      }

      const isValidPassword = await verifyPassword(currentPassword, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }

      const newPasswordHash = await hashPassword(newPassword);
      await storage.updateUserPassword(user.id, newPasswordHash);

      res.json({ message: "Password changed successfully" });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });
}

export const isAuthenticated: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const user = await storage.getUser(req.session.userId);
    
    if (!user || !user.isActive) {
      req.session.destroy(() => {});
      return res.status(401).json({ message: "Unauthorized" });
    }

    (req as any).dbUser = user;
    next();
  } catch (error) {
    console.error("Authentication check failed:", error);
    res.status(500).json({ message: "Authentication check failed" });
  }
};

export const requireRole = (...allowedRoles: string[]): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const user = await storage.getUser(req.session.userId);
      
      if (!user || !user.isActive) {
        return res.status(401).json({ message: "User not found or inactive" });
      }

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ message: `Access denied. Required role: ${allowedRoles.join(" or ")}` });
      }

      (req as any).dbUser = user;
      next();
    } catch (error) {
      console.error("Role check failed:", error);
      res.status(500).json({ message: "Authorization check failed" });
    }
  };
};
