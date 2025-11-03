import Category from "../models/category.model.js";
import FoodItem from "../models/foodItem.model.js";

export async function addCategory(req, res) {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category with this name already exists",
      });
    }

    const category = new Category({
      name: name.trim(),
      description: description?.trim(),
    });

    await category.save();

    const categoryData = category.toObject();

    const analytics = await getCategoryAnalytics();

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: {
        category: categoryData,
        analytics,
      },
    });
  } catch (error) {
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
