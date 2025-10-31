import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../services/token.service.js";

export async function registerUser(req, res) {
  const userBody = req.body;

  try {
    const existingUser = await User.findOne({ email: userBody?.email });
    if (existingUser) {
      return res.status(400).send({
        ok: false,
        message: "Something went wrong",
        error: "Email already taken!",
        errorType: "ExistingValue",
      });
    }

    const user = await User.create({
      name: userBody.name,
      email: userBody.email,
      password: userBody.password,
    });

    res.status(200).send({
      ok: true,
      message: "User Registered Successfully",
      data: user,
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      message: "Something went wrong",
      error: err instanceof Error ? err.message : err,
      errorType: err instanceof Error ? err.name : "Error",
    });
  }
}

export async function loginUser(req, res) {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({
        ok: false,
        message: "Please provide email and password",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        ok: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        ok: false,
        message: "Invalid email or password",
      });
    }

    await user.handleLogin();

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const userResponse = user.toJSON();

    res.status(200).json({
      ok: true,
      message: "Login successful",
      data: {
        user: userResponse,
        accessToken,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      ok: false,
      message: "Something went wrong",
      error: err instanceof Error ? err.message : err,
      errorType: err instanceof Error ? err.name : "Error",
    });
  }
}

export async function refreshToken(req, res) {
  try {
    const refreshToken = req.cookies.refreshToken;
    console.log(refreshToken);

    if (!refreshToken) {
      return res.status(401).json({
        ok: false,
        message: "Refresh token not found",
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        ok: false,
        message: "User not found",
      });
    }

    const newAccessToken = generateAccessToken(user._id);

    res.status(200).json({
      ok: true,
      message: "Token refreshed successfully",
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return res.status(401).json({
        ok: false,
        message: "Invalid or expired refresh token",
      });
    }

    res.status(500).json({
      ok: false,
      message: "Something went wrong",
      error: err instanceof Error ? err.message : err,
    });
  }
}

export async function logoutUser(req, res) {
  try {
    const userId = req.user?.userId;

    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        await user.handleLogout();
      }
    }

    res.clearCookie("refreshToken");

    res.status(200).json({
      ok: true,
      message: "Logout successful",
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      message: "Something went wrong",
      error: err instanceof Error ? err.message : err,
    });
  }
}
