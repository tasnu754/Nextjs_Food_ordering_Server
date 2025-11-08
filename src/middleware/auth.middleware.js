import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export async function authenticate(req, res, next) {
  try {
    const authHeader = req?.headers?.authorization;

    if (!authHeader || !authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        ok: false,
        message: "Access token not found",
      });
    }

    const token = authHeader?.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        ok: false,
        message: "User not found",
      });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        ok: false,
        message: "Invalid access token",
      });
    }

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        ok: false,
        message: "Access token expired",
      });
    }

    res.status(500).json({
      ok: false,
      message: "Authentication failed",
      error: err instanceof Error ? err.message : err,
    });
  }
}

export const authorize = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.body.userId || req.query.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required: No user ID provided",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied: Admin privileges required",
      });
    }

    req.adminUser = user;
    next();
  } catch (error) {
    console.error("Admin middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error in authentication",
      error: error.message,
    });
  }
};

export const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Not authorized, invalid token",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Not authorized, token expired",
      });
    }

    res.status(401).json({
      success: false,
      message: "Not authorized",
    });
  }
};

export const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Not authorized as admin. Admin access required.",
    });
  }
};
