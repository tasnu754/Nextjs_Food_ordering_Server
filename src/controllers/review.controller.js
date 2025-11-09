import FoodItem from "../models/foodItem.model.js";
import Order from "../models/order.model.js";

export const addReview = async (req, res) => {
  try {
    const { foodItemId } = req.params;
    const { stars, comment } = req.body;

    if (!stars || !comment) {
      return res.status(400).json({
        success: false,
        message: "Rating and comment are required",
      });
    }

    if (stars < 1 || stars > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    const foodItem = await FoodItem.findById(foodItemId);
    if (!foodItem) {
      return res.status(404).json({
        success: false,
        message: "Food item not found",
      });
    }

    const hasOrdered = await Order.findOne({
      user: req.user._id,
      "items.foodItem": foodItemId,
      orderStatus: "delivered",
    });

    if (!hasOrdered) {
      return res.status(403).json({
        success: false,
        message: "You can only review items you have ordered and received",
      });
    }

    const existingReview = foodItem.reviews.find(
      (review) => review.userId.toString() === req.user._id.toString()
    );

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this item",
      });
    }

    foodItem.reviews.push({
      userId: req.user._id,
      stars: parseInt(stars),
      comment: comment.trim(),
      createdAt: new Date(),
    });

    foodItem.calculateAverageRating();

    await foodItem.save();

    await foodItem.populate({
      path: "reviews.userId",
      select: "name email",
    });

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      data: foodItem,
    });
  } catch (error) {
    console.error("Add review error:", error);
    res.status(500).json({
      success: false,
      message: "Error adding review",
      error: error.message,
    });
  }
};

export const updateReview = async (req, res) => {
  try {
    const { foodItemId, reviewId } = req.params;
    const { stars, comment } = req.body;

    if (!stars || !comment) {
      return res.status(400).json({
        success: false,
        message: "Rating and comment are required",
      });
    }

    if (stars < 1 || stars > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    const foodItem = await FoodItem.findById(foodItemId);
    if (!foodItem) {
      return res.status(404).json({
        success: false,
        message: "Food item not found",
      });
    }

    const review = foodItem.reviews.id(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own reviews",
      });
    }

    review.stars = parseInt(stars);
    review.comment = comment.trim();

    foodItem.calculateAverageRating();

    await foodItem.save();

    await foodItem.populate({
      path: "reviews.userId",
      select: "name email",
    });

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: foodItem,
    });
  } catch (error) {
    console.error("Update review error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating review",
      error: error.message,
    });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { foodItemId, reviewId } = req.params;

    const foodItem = await FoodItem.findById(foodItemId);
    if (!foodItem) {
      return res.status(404).json({
        success: false,
        message: "Food item not found",
      });
    }

    const review = foodItem.reviews.id(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    if (
      review.userId.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own reviews",
      });
    }

    foodItem.reviews.pull(reviewId);

    foodItem.calculateAverageRating();

    await foodItem.save();

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
      data: foodItem,
    });
  } catch (error) {
    console.error("Delete review error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting review",
      error: error.message,
    });
  }
};

export const getUserReview = async (req, res) => {
  try {
    const { foodItemId } = req.params;

    const foodItem = await FoodItem.findById(foodItemId).populate({
      path: "reviews.userId",
      select: "name email",
    });

    if (!foodItem) {
      return res.status(404).json({
        success: false,
        message: "Food item not found",
      });
    }

    const userReview = foodItem.reviews.find(
      (review) => review.userId._id.toString() === req.user._id.toString()
    );

    res.status(200).json({
      success: true,
      data: {
        hasReviewed: !!userReview,
        review: userReview || null,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user review",
      error: error.message,
    });
  }
};

export const canUserReview = async (req, res) => {
  try {
    const { foodItemId } = req.params;

    const hasOrdered = await Order.findOne({
      user: req.user._id,
      "items.foodItem": foodItemId,
      orderStatus: "delivered",
    });

    const foodItem = await FoodItem.findById(foodItemId);
    if (!foodItem) {
      return res.status(404).json({
        success: false,
        message: "Food item not found",
      });
    }

    const hasReviewed = foodItem.reviews.some(
      (review) => review.userId.toString() === req.user._id.toString()
    );

    res.status(200).json({
      success: true,
      data: {
        canReview: !!hasOrdered && !hasReviewed,
        hasOrdered: !!hasOrdered,
        hasReviewed: hasReviewed,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error checking review eligibility",
      error: error.message,
    });
  }
};
