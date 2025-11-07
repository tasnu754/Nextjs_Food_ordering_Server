import { Schema, model } from "mongoose";

const cartItemSchema = new Schema(
  {
    foodItem: {
      type: Schema.Types.ObjectId,
      ref: "FoodItem",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    variant: {
      type: String,
      enum: ["small", "regular", "large", "extra large"],
      default: "regular",
    },
  },
  { _id: true }
);

const cartSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
    totalItems: {
      type: Number,
      default: 0,
    },
    subtotal: {
      type: Number,
      default: 0,
    },
    deliveryFee: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate totals before saving
cartSchema.pre("save", function (next) {
  // Calculate total items
  this.totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);

  // Calculate subtotal
  this.subtotal = this.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Set delivery fee based on subtotal
  if (this.subtotal > 50) {
    this.deliveryFee = 0; // Free delivery over $50
  } else if (this.subtotal > 0) {
    this.deliveryFee = 5;
  } else {
    this.deliveryFee = 0;
  }

  // Calculate total
  this.total = this.subtotal + this.deliveryFee;

  next();
});

// Method to add item to cart
cartSchema.methods.addItem = function (foodItemId, quantity, price, variant) {
  const existingItemIndex = this.items.findIndex(
    (item) =>
      item.foodItem.toString() === foodItemId.toString() &&
      item.variant === variant
  );

  if (existingItemIndex > -1) {
    // Item already exists, update quantity
    this.items[existingItemIndex].quantity += quantity;
  } else {
    // Add new item
    this.items.push({
      foodItem: foodItemId,
      quantity,
      price,
      variant,
    });
  }

  return this.save();
};

// Method to update item quantity
cartSchema.methods.updateItemQuantity = function (itemId, quantity) {
  const item = this.items.id(itemId);
  if (item) {
    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      this.items.pull(itemId);
    } else {
      item.quantity = quantity;
    }
    return this.save();
  }
  throw new Error("Item not found in cart");
};

// Method to remove item from cart
cartSchema.methods.removeItem = function (itemId) {
  this.items.pull(itemId);
  return this.save();
};

// Method to clear cart
cartSchema.methods.clearCart = function () {
  this.items = [];
  return this.save();
};

// Method to check if item exists
cartSchema.methods.hasItem = function (foodItemId, variant = "regular") {
  return this.items.some(
    (item) =>
      item.foodItem.toString() === foodItemId.toString() &&
      item.variant === variant
  );
};

export default model("Cart", cartSchema);
