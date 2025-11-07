import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage configuration for categories
const categoryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "food-categories",
    allowed_formats: ["jpg", "jpeg", "jfif", "png", "webp", "gif"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  },
});

// Storage configuration for food items
const foodStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "food-items",
    allowed_formats: ["jpg", "jpeg", "jfif", "png", "webp", "gif"],
    transformation: [{ width: 800, height: 600, crop: "limit" }],
  },
});

// Storage configuration for user profiles
const profileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "user-profiles",
    allowed_formats: ["jpg", "jpeg", "jfif", "png", "webp", "gif"],
    transformation: [
      {
        width: 400,
        height: 400,
        crop: "fill",
        gravity: "face",
        quality: "auto",
      },
    ],
  },
});

// Create separate upload middleware for categories and food items
export const uploadCategory = multer({
  storage: categoryStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

export const uploadFood = multer({
  storage: foodStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

export const uploadProfile = multer({
  storage: profileStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

export default cloudinary;
