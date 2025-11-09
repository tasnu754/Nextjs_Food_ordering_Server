import Cart from "../models/cart.model.js";
import FoodItem from "../models/foodItem.model.js";

// Get user's cart
export const getCart = async (req, res) => {
  try {
    const userId = req.query.id || req.user._id;
    let cart = await Cart.findOne({ userId }).populate({
      path: "items.foodItem",
      select: "foodName thumbnail price isAvailable",
    });

    if (!cart) {
      // Create a new cart if it doesn't exist
      cart = await Cart.create({ userId: req.user._id, items: [] });
    }

    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching cart",
      error: error.message,
    });
  }
};

// Add item to cart
export const addToCart = async (req, res) => {
  try {
    const { foodItemId, quantity = 1, variant = "regular" } = req.body;

    // Validate food item exists
    const foodItem = await FoodItem.findById(foodItemId);
    if (!foodItem) {
      return res.status(404).json({
        success: false,
        message: "Food item not found",
      });
    }

    if (!foodItem.isAvailable) {
      return res.status(400).json({
        success: false,
        message: "This item is currently unavailable",
      });
    }

    // Find or create cart
    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = new Cart({ userId: req.user._id, items: [] });
    }

    // Add item to cart
    await cart.addItem(foodItemId, quantity, foodItem.price, variant);

    // Populate and return updated cart
    await cart.populate({
      path: "items.foodItem",
      select: "foodName thumbnail price isAvailable",
    });

    res.status(200).json({
      success: true,
      message: "Item added to cart",
      data: cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adding item to cart",
      error: error.message,
    });
  }
};

// Update item quantity
export const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (quantity < 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be 0 or greater",
      });
    }

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    await cart.updateItemQuantity(itemId, quantity);
    await cart.populate({
      path: "items.foodItem",
      select: "foodName thumbnail price isAvailable",
    });

    res.status(200).json({
      success: true,
      message: quantity === 0 ? "Item removed from cart" : "Cart updated",
      data: cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating cart item",
      error: error.message,
    });
  }
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    await cart.removeItem(itemId);
    await cart.populate({
      path: "items.foodItem",
      select: "foodName thumbnail price isAvailable",
    });

    res.status(200).json({
      success: true,
      message: "Item removed from cart",
      data: cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error removing item from cart",
      error: error.message,
    });
  }
};

// Clear cart
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    await cart.clearCart();

    res.status(200).json({
      success: true,
      message: "Cart cleared",
      data: cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error clearing cart",
      error: error.message,
    });
  }
};

// Increment item quantity
export const incrementCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    item.quantity += 1;
    await cart.save();
    await cart.populate({
      path: "items.foodItem",
      select: "foodName thumbnail price isAvailable",
    });

    res.status(200).json({
      success: true,
      message: "Item quantity increased",
      data: cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error incrementing item",
      error: error.message,
    });
  }
};

// Decrement item quantity
export const decrementCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    if (item.quantity > 1) {
      item.quantity -= 1;
      await cart.save();
    } else {
      await cart.removeItem(itemId);
    }

    await cart.populate({
      path: "items.foodItem",
      select: "foodName thumbnail price isAvailable",
    });

    res.status(200).json({
      success: true,
      message: item.quantity > 0 ? "Item quantity decreased" : "Item removed",
      data: cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error decrementing item",
      error: error.message,
    });
  }
};
