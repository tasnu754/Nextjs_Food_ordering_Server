import User from "../models/user.model.js";

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

export async function loginUser(req, res) {}
