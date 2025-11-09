import { Schema, model } from "mongoose";

const wishlistItemSchema = new Schema(
  {
    foodItem: {
      type: Schema.Types.ObjectId,
      ref: "FoodItem",
      required: true,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const wishlistSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [wishlistItemSchema],
  },
  {
    timestamps: true,
  }
);

wishlistSchema.methods.addItem = function (foodItemId) {
  const existingItem = this.items.find(
    (item) => item.foodItem.toString() === foodItemId.toString()
  );

  if (!existingItem) {
    this.items.push({
      foodItem: foodItemId,
      addedAt: new Date(),
    });
    return this.save();
  }

  return Promise.resolve(this);
};

wishlistSchema.methods.removeItem = function (foodItemId) {
  this.items = this.items.filter(
    (item) => item.foodItem.toString() !== foodItemId.toString()
  );
  return this.save();
};

wishlistSchema.methods.hasItem = function (foodItemId) {
  return this.items.some(
    (item) => item.foodItem.toString() === foodItemId.toString()
  );
};

wishlistSchema.methods.toggleItem = function (foodItemId) {
  const itemIndex = this.items.findIndex(
    (item) => item.foodItem.toString() === foodItemId.toString()
  );

  if (itemIndex > -1) {
    this.items.splice(itemIndex, 1);
  } else {
    this.items.push({
      foodItem: foodItemId,
      addedAt: new Date(),
    });
  }

  return this.save();
};

wishlistSchema.methods.clearWishlist = function () {
  this.items = [];
  return this.save();
};

wishlistSchema.virtual("itemCount").get(function () {
  return this.items.length;
});

wishlistSchema.set("toJSON", { virtuals: true });

export default model("Wishlist", wishlistSchema);
