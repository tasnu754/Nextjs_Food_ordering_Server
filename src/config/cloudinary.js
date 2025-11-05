// import { v2 as cloudinary } from "cloudinary";
// import { CloudinaryStorage } from "multer-storage-cloudinary";
// import multer from "multer";

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: "food-categories",
//     allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
//     transformation: [{ width: 500, height: 500, crop: "limit" }],
//   },
// });

// export const upload = multer({
//   storage: storage,
//   limits: {
//     fileSize: 5 * 1024 * 1024,
//   },
// });

// export default cloudinary;

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

export default cloudinary;
