import FoodItem from "../models/foodItem.model.js";
import Category from "../models/category.model.js";

export async function createFoodItem(req, res) {
  try {
    const category = await Category.findById(req.body.category);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const foodItem = await FoodItem.create(req.body);
    await foodItem.populate("category", "name slug");

    res.status(201).json({
      success: true,
      message: "Food item created successfully",
      data: foodItem,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error creating food item",
      error: error.message,
    });
  }
}
