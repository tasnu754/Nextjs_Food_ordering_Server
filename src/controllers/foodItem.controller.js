import FoodItem from "../models/foodItem.model.js";
import Category from "../models/category.model.js";

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
      isFeatured: false,
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
