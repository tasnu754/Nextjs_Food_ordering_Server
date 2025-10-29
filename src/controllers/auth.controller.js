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
