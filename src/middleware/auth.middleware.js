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
