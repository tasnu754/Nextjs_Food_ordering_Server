import User from "../models/user.model.js";
import cloudinary from "../config/cloudinary.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching users",
      error: error.message,
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: {
        id: deletedUser._id,
        username: deletedUser.username,
        email: deletedUser.email,
      },
    });
  } catch (error) {
    console.error("Error deleting user:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while deleting user",
      error: error.message,
    });
  }
};

export const makeAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndUpdate(
      userId,
      { role: "admin" },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User promoted to admin successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error making admin:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating user role",
      error: error.message,
    });
  }
};

export const removeAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndUpdate(
      userId,
      { role: "user" },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Admin role removed successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error removing admin:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating user role",
      error: error.message,
    });
  }
};

// export const updateProfile = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     const updateData = {};

//     // Handle name update
//     if (req.body.name) {
//       updateData.name = req.body.name;
//     }

//     // Handle profile image update
//     if (req.file) {
//       // Delete old profile image from Cloudinary if exists
//       if (user.profileImage?.publicId) {
//         try {
//           await deleteFromCloudinary(user.profileImage.publicId);
//         } catch (error) {
//           console.error("Error deleting old profile image:", error);
//         }
//       }

//       updateData.profileImage = {
//         url: req.file.path,
//         publicId: req.file.filename,
//       };
//     }

//     const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
//       new: true,
//       runValidators: true,
//     }).select("-password");

//     res.json({
//       success: true,
//       message: "Profile updated successfully",
//       user: updatedUser,
//     });
//   } catch (error) {
//     console.error("Profile update error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };

// export const updateProfile = async (req, res) => {
//   try {
//     const { name } = req.body;
//     console.log(req.body);
//     const user = await User.findById(req.body.id);

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Update name if provided
//     if (name && name.trim() !== "") {
//       user.name = name.trim();
//     }

//     // Update profile image if file is uploaded
//     if (req.file) {
//       // Delete old image from Cloudinary if exists
//       if (user.profileImage?.publicId) {
//         try {
//           // await deleteFromCloudinary(user.profileImage.publicId);
//           await cloudinary.uploader.destroy(req.file.filename);
//         } catch (error) {
//           console.error("Error deleting old image:", error);
//         }
//       }

//       // Set new image
//       user.profileImage = {
//         url: req.file.path,
//         publicId: req.file.filename,
//       };
//     }

//     await user.save();

//     res.status(200).json({
//       message: "Profile updated successfully",
//       user,
//     });
//   } catch (error) {
//     console.error("Update profile error:", error);
//     res.status(500).json({
//       message: error.message || "Failed to update profile",
//     });
//   }
// };

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from authenticated request
    const { name } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update name if provided
    if (name && name.trim() !== "") {
      user.name = name.trim();
    }

    // Update profile image if file is uploaded
    if (req.file) {
      // Delete old image from Cloudinary if exists
      if (user.profileImage?.publicId) {
        try {
          await cloudinary.uploader.destroy(user.profileImage.publicId);
        } catch (error) {
          console.error("Error deleting old image:", error);
        }
      }

      // Set new image
      user.profileImage = {
        url: req.file.path,
        publicId: req.file.filename,
      };
    }

    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update profile",
    });
  }
};
