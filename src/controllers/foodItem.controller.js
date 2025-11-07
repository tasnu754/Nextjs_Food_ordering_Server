import FoodItem from "../models/foodItem.model.js";
import Category from "../models/category.model.js";
import mongoose from "mongoose";
import cloudinary from "../config/cloudinary.js";

export const createFoodItem = async (req, res) => {
  try {
    const {
      foodName,
      price,
      weight,
      category,
      shortDescription,
      variants,
      fullDescription,
      isFeatured,
    } = req.body;

    // Validate required fields
    if (!foodName || !price || !weight || !category || !shortDescription) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    // Check if category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Check if food item with same name already exists
    const existingFoodItem = await FoodItem.findOne({
      foodName: { $regex: new RegExp(`^${foodName}$`, "i") },
    });

    if (existingFoodItem) {
      return res.status(409).json({
        success: false,
        message: "Food item with this name already exists",
      });
    }

    // Parse JSON fields
    let parsedVariants = [];
    let parsedFullDescription = {};

    try {
      if (variants) {
        parsedVariants = JSON.parse(variants);
      }

      if (fullDescription) {
        parsedFullDescription = JSON.parse(fullDescription);
      }
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        message: "Invalid JSON format in variants or fullDescription",
      });
    }

    // Validate variants structure
    if (parsedVariants && Array.isArray(parsedVariants)) {
      const validSizes = ["small", "regular", "large", "extra large"];
      for (const variant of parsedVariants) {
        if (!validSizes.includes(variant)) {
          return res.status(400).json({
            success: false,
            message: `Invalid variant size: ${variant}. Must be one of: ${validSizes.join(
              ", "
            )}`,
          });
        }
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Variants must be an array",
      });
    }

    // Validate fullDescription structure
    if (parsedFullDescription) {
      if (
        parsedFullDescription.bullets &&
        !Array.isArray(parsedFullDescription.bullets)
      ) {
        return res.status(400).json({
          success: false,
          message: "Bullet points must be an array",
        });
      }
    }

    // Handle multiple file uploads
    const thumbnailFile = req.files?.thumbnail?.[0];
    const additionalImageFiles = req.files?.additionalImages || [];

    if (!thumbnailFile) {
      return res.status(400).json({
        success: false,
        message: "Thumbnail image is required",
      });
    }

    // Get Cloudinary URLs for all images
    const thumbnailUrl = thumbnailFile.path;
    const additionalImageUrls = additionalImageFiles.map((file) => file.path);

    // Create food item
    const newFoodItem = new FoodItem({
      foodName,
      price: parseFloat(price),
      weight,
      category,
      shortDescription,
      variants: parsedVariants,
      fullDescription: {
        introduction: parsedFullDescription.intro || "",
        bulletPoints: parsedFullDescription.bullets || [],
        conclusion: parsedFullDescription.outro || "",
      },
      thumbnail: thumbnailUrl,
      additionalImages: additionalImageUrls,
      isAvailable: true,
      isFeatured,
    });

    // Save food item
    const savedFoodItem = await newFoodItem.save();

    // Increment category item count
    await Category.findByIdAndUpdate(category, {
      $inc: { itemCount: 1 },
    });

    // Populate category details in response
    await savedFoodItem.populate("category", "name slug");

    res.status(201).json({
      success: true,
      message: "Food item created successfully",
      data: savedFoodItem,
    });
  } catch (error) {
    console.error("Error creating food item:", error);

    // Handle duplicate key error (slug)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Food item with this name already exists",
      });
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getAllFoodItems = async (req, res) => {
  try {
    const { category, isFeatured } = req.query;

    let query = {};

    if (category) {
      query.category = category;
    }
    if (isFeatured) {
      query.isFeatured = isFeatured;
    }

    const foodItems = await FoodItem.find(query)
      .populate("category", "name slug")
      .sort({ averageRating: -1, createdAt: -1 });

    res.json({
      success: true,
      data: {
        foodItems,
      },
    });
  } catch (error) {
    console.error("Error fetching Food Items:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching food items",
      error: error.message,
    });
  }
};

export const getSingleFoodItem = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Food item ID is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid food item ID format",
      });
    }

    const foodItem = await FoodItem.findById(id).populate(
      "category",
      "name slug"
    );

    if (!foodItem) {
      return res.status(404).json({
        success: false,
        message: "Food item not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Food item retrieved successfully",
      data: foodItem,
    });
  } catch (error) {
    console.error("Error fetching food item:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid food item ID",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const updateFoodItem = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      foodName,
      price,
      weight,
      category,
      shortDescription,
      variants,
      fullDescription,
      isFeatured,
      isAvailable,
    } = req.body;

    const foodItem = await FoodItem.findById(id);

    if (!foodItem) {
      return res.status(404).json({
        success: false,
        message: "Food item not found",
      });
    }

    // Handle thumbnail update
    if (req.files?.thumbnail && req.files.thumbnail[0]) {
      // Delete old thumbnail from Cloudinary
      if (foodItem.thumbnail) {
        const publicId = getPublicIdFromUrl(foodItem.thumbnail);
        if (publicId) {
          try {
            await cloudinary.uploader.destroy(publicId);
          } catch (error) {
            console.error("Error deleting old thumbnail:", error);
          }
        }
      }
      foodItem.thumbnail = req.files.thumbnail[0].path;
    }

    // Handle additional images update
    if (req.files?.additionalImages && req.files.additionalImages.length > 0) {
      // Delete old additional images from Cloudinary
      if (foodItem.additionalImages && foodItem.additionalImages.length > 0) {
        for (const imageUrl of foodItem.additionalImages) {
          const publicId = getPublicIdFromUrl(imageUrl);
          if (publicId) {
            try {
              await cloudinary.uploader.destroy(publicId);
            } catch (error) {
              console.error("Error deleting old additional image:", error);
            }
          }
        }
      }
      foodItem.additionalImages = req.files.additionalImages.map(
        (file) => file.path
      );
    }

    // Update other fields
    if (foodName) foodItem.foodName = foodName;
    if (price) foodItem.price = price;
    if (weight) foodItem.weight = weight;
    if (category) foodItem.category = category;
    if (shortDescription) foodItem.shortDescription = shortDescription;
    if (variants) foodItem.variants = JSON.parse(variants);
    if (fullDescription) {
      const parsedDesc = JSON.parse(fullDescription);
      foodItem.fullDescription = {
        introduction: parsedDesc.intro,
        bulletPoints: parsedDesc.bullets,
        conclusion: parsedDesc.outro,
      };
    }
    if (isFeatured !== undefined)
      foodItem.isFeatured = isFeatured === "true" || isFeatured === true;
    if (isAvailable !== undefined)
      foodItem.isAvailable = isAvailable === "true" || isAvailable === true;

    await foodItem.save();

    res.status(200).json({
      success: true,
      message: "Food item updated successfully",
      data: { foodItem },
    });
  } catch (error) {
    console.error("Update food item error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update food item",
    });
  }
};

export const deleteFoodItem = async (req, res) => {
  try {
    const { id } = req.params;

    const foodItem = await FoodItem.findById(id);

    if (!foodItem) {
      return res.status(404).json({
        success: false,
        message: "Food item not found",
      });
    }

    await FoodItem.findByIdAndDelete(id);

    await Category.findByIdAndUpdate(foodItem.category, {
      $inc: { itemCount: -1 },
    });

    res.status(200).json({
      success: true,
      message: "Food item deleted successfully",
    });
  } catch (error) {
    console.error("Delete food item error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete food item",
    });
  }
};
