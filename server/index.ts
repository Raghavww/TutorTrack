import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

// Load .env ONLY in local development
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

// 🔴 HARD FAIL if DATABASE_URL missing (clear error)
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to configure Railway variables?");
}

const app = express();

// ✅ REQUIRED for Railway / HTTPS cookies
app.set("trust proxy", 1);

// ✅ CORS (adjust frontend URL!)
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://your-frontend.vercel.app" // 🔁 CHANGE THIS
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 🔹 Request logger (unchanged, just cleaned)
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined;

  const originalResJson = res.json.bind(res);
  res.json = (bodyJson, ...args) => {
    capturedJsonResponse = bodyJson;
    return originalResJson(bodyJson, ...args);
  };

  res.on("finish", () => {
    if (!path.startsWith("/api")) return;

    const duration = Date.now() - start;
    let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;

    if (capturedJsonResponse) {
      logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
    }

    if (logLine.length > 120) {
      logLine = logLine.slice(0, 119) + "…";
    }

    log(logLine);
  });

  next();
});

(async () => {
  // 🔹 Register API routes (sessions must already be set there)
  const server = await registerRoutes(app);

  // 🔹 Global error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    console.error(err);
  });

  // 🔹 Vite in dev, static in prod
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ✅ Railway injects PORT automatically
  const port = Number(process.env.PORT) || 5000;

  server.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`🚀 Server running on port ${port}`);
    }
  );
})();
