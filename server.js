import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./src/config/database.js";
import authRoutes from "./src/routes/auth.routes.js";
import userRoutes from "./src/routes/user.routes.js";

const app = express();

connectDB();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// 🎯 ADD THIS DEBUG MIDDLEWARE
app.use((req, res, next) => {
  console.log("🚀 INCOMING REQUEST:", req.method, req.url);
  console.log("📁 Full URL:", req.originalUrl);
  next();
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);

// Health check route
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// Basic error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
