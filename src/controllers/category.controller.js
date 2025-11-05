import Category from "../models/category.model.js";
import FoodItem from "../models/foodItem.model.js";
import cloudinary from "../config/cloudinary.js";

export async function addCategory(req, res) {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      if (req.file) {
        await cloudinary.uploader.destroy(req.file.filename);
      }
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });

    if (existingCategory) {
      if (req.file) {
        await cloudinary.uploader.destroy(req.file.filename);
      }
      return res.status(400).json({
        success: false,
        message: "Category with this name already exists",
      });
    }

    const categoryData = {
      name: name.trim(),
      description: description?.trim(),
    };

    if (req.file) {
      categoryData.image = {
        url: req.file.path,
        publicId: req.file.filename,
      };
    }

    const category = new Category(categoryData);
    await category.save();

    const categoryResponse = category.toObject();

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: categoryResponse,
    });
  } catch (error) {
    if (req.file) {
      try {
        await cloudinary.uploader.destroy(req.file.filename);
      } catch (cleanupError) {
        console.error("Error cleaning up image:", cleanupError);
      }
    }

    console.error("Error creating category:", error);
    res.status(500).json({
      success: false,
      message: "Error creating category",
      error: error.message,
    });
  }
}

export async function getAllCategories(req, res) {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    const analytics = await getCategoryAnalytics();

    res.json({
      success: true,
      data: {
        categories,
        analytics,
      },
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching categories",
      error: error.message,
    });
  }
}

export async function updateCategory(req, res) {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      if (req.file) {
        await cloudinary.uploader.destroy(req.file.filename);
      }
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Check if new name conflicts with existing category
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({
        name: { $regex: new RegExp(`^${name}$`, "i") },
        _id: { $ne: id },
      });

      if (existingCategory) {
        if (req.file) {
          await cloudinary.uploader.destroy(req.file.filename);
        }
        return res.status(400).json({
          success: false,
          message: "Category with this name already exists",
        });
      }
    }

    // Update basic fields
    if (name) category.name = name.trim();
    if (description !== undefined) category.description = description.trim();

    // Handle image update
    if (req.file) {
      // Delete old image if exists
      if (category.image?.publicId) {
        try {
          await cloudinary.uploader.destroy(category.image.publicId);
        } catch (error) {
          console.error("Error deleting old image:", error);
        }
      }

      // Set new image
      category.image = {
        url: req.file.path,
        publicId: req.file.filename,
      };
    }

    await category.save();

    res.json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    if (req.file) {
      try {
        await cloudinary.uploader.destroy(req.file.filename);
      } catch (cleanupError) {
        console.error("Error cleaning up image:", cleanupError);
      }
    }

    console.error("Error updating category:", error);
    res.status(500).json({
      success: false,
      message: "Error updating category",
      error: error.message,
    });
  }
}

export async function deleteCategory(req, res) {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const itemsCount = await FoodItem.countDocuments({ category: id });
    if (itemsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It has ${itemsCount} item(s) associated with it.`,
      });
    }

    // Delete image from Cloudinary if exists
    if (category.image?.publicId) {
      try {
        await cloudinary.uploader.destroy(category.image.publicId);
      } catch (error) {
        console.error("Error deleting image from Cloudinary:", error);
      }
    }

    await Category.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Category deleted successfully",
      data: category,
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting category",
      error: error.message,
    });
  }
}

async function getCategoryAnalytics() {
  try {
    const totalCategories = await Category.countDocuments();
    const totalItems = await FoodItem.countDocuments();
    const avgItemsPerCategory =
      totalCategories > 0
        ? Number((totalItems / totalCategories).toFixed(2))
        : 0;

    const allCategories = await Category.find().select("name itemCount slug");
    const popularCategories = allCategories.filter((cat) => cat.itemCount > 7);

    return {
      totalCategories,
      totalItems,
      avgItemsPerCategory,
      popularCategories: popularCategories.map((cat) => ({
        name: cat.name,
        itemCount: cat.itemCount,
        slug: cat.slug,
        isPopular: true,
      })),
    };
  } catch (error) {
    console.error("Error calculating analytics:", error);
    return {
      totalCategories: 0,
      totalItems: 0,
      avgItemsPerCategory: 0,
      popularCategories: [],
    };
  }
}
