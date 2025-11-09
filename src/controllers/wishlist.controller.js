import Wishlist from "../models/wishlist.model.js";
import FoodItem from "../models/foodItem.model.js";

export const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ userId: req.user._id }).populate({
      path: "items.foodItem",
      select:
        "foodName thumbnail price averageRating isFeatured isAvailable category shortDescription",
      populate: {
        path: "category",
        select: "name",
      },
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({ userId: req.user._id, items: [] });
    }

    res.status(200).json({
      success: true,
      data: wishlist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching wishlist",
      error: error.message,
    });
  }
};

export const addToWishlist = async (req, res) => {
  try {
    const { foodItemId } = req.body;

    const foodItem = await FoodItem.findById(foodItemId);
    if (!foodItem) {
      return res.status(404).json({
        success: false,
        message: "Food item not found",
      });
    }

    let wishlist = await Wishlist.findOne({ userId: req.user._id });
    if (!wishlist) {
      wishlist = new Wishlist({ userId: req.user._id, items: [] });
    }

    if (wishlist.hasItem(foodItemId)) {
      return res.status(400).json({
        success: false,
        message: "Item already in wishlist",
      });
    }

    await wishlist.addItem(foodItemId);

    await wishlist.populate({
      path: "items.foodItem",
      select:
        "foodName thumbnail price averageRating isAvailable category shortDescription",
      populate: {
        path: "category",
        select: "name",
      },
    });

    res.status(200).json({
      success: true,
      message: "Item added to wishlist",
      data: wishlist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adding item to wishlist",
      error: error.message,
    });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const { foodItemId } = req.params;

    const wishlist = await Wishlist.findOne({ userId: req.user._id });
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found",
      });
    }

    await wishlist.removeItem(foodItemId);
    await wishlist.populate({
      path: "items.foodItem",
      select:
        "foodName thumbnail price averageRating isAvailable category shortDescription",
      populate: {
        path: "category",
        select: "name",
      },
    });

    res.status(200).json({
      success: true,
      message: "Item removed from wishlist",
      data: wishlist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error removing item from wishlist",
      error: error.message,
    });
  }
};

export const toggleWishlistItem = async (req, res) => {
  try {
    const { foodItemId } = req.body;

    const foodItem = await FoodItem.findById(foodItemId);
    if (!foodItem) {
      return res.status(404).json({
        success: false,
        message: "Food item not found",
      });
    }

    let wishlist = await Wishlist.findOne({ userId: req.user._id });
    if (!wishlist) {
      wishlist = new Wishlist({ userId: req.user._id, items: [] });
    }

    const wasInWishlist = wishlist.hasItem(foodItemId);

    await wishlist.toggleItem(foodItemId);

    await wishlist.populate({
      path: "items.foodItem",
      select:
        "foodName thumbnail price averageRating isAvailable category shortDescription",
      populate: {
        path: "category",
        select: "name",
      },
    });

    res.status(200).json({
      success: true,
      message: wasInWishlist
        ? "Item removed from wishlist"
        : "Item added to wishlist",
      data: wishlist,
      action: wasInWishlist ? "removed" : "added",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error toggling wishlist item",
      error: error.message,
    });
  }
};

export const clearWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.user._id });
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found",
      });
    }

    await wishlist.clearWishlist();

    res.status(200).json({
      success: true,
      message: "Wishlist cleared",
      data: wishlist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error clearing wishlist",
      error: error.message,
    });
  }
};

export const checkWishlistItem = async (req, res) => {
  try {
    const { foodItemId } = req.params;

    const wishlist = await Wishlist.findOne({ userId: req.user._id });

    if (!wishlist) {
      return res.status(200).json({
        success: true,
        data: {
          inWishlist: false,
        },
      });
    }

    const inWishlist = wishlist.hasItem(foodItemId);

    res.status(200).json({
      success: true,
      data: {
        inWishlist,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error checking wishlist item",
      error: error.message,
    });
  }
};
