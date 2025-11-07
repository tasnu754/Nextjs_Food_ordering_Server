import { Schema, model } from "mongoose";

const reviewSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    stars: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const fullDescriptionSchema = new Schema(
  {
    introduction: {
      type: String,
      trim: true,
    },
    bulletPoints: [
      {
        type: String,
        trim: true,
      },
    ],
    conclusion: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const foodItemSchema = new Schema(
  {
    thumbnail: {
      type: String,
      required: [true, "Thumbnail image is required"],
    },
    additionalImages: [
      {
        type: String,
      },
    ],
    foodName: {
      type: String,
      required: [true, "Food name is required"],
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 0,
    },
    weight: {
      type: String,
      required: [true, "Weight is required"],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
      index: true,
    },
    variants: [
      {
        type: String,
        enum: ["small", "regular", "large", "extra large"],
      },
    ],
    shortDescription: {
      type: String,
      required: [true, "Short description (ingredients) is required"],
      trim: true,
    },
    fullDescription: fullDescriptionSchema,
    reviews: [reviewSchema],
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

foodItemSchema.pre("save", function (next) {
  if (this.isModified("foodName")) {
    this.slug = this.foodName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  }
  next();
});

foodItemSchema.methods.calculateAverageRating = function () {
  if (this.reviews.length === 0) {
    this.averageRating = 0;
    this.totalReviews = 0;
  } else {
    const sum = this.reviews.reduce((acc, review) => acc + review.stars, 0);
    this.averageRating = sum / this.reviews.length;
    this.totalReviews = this.reviews.length;
  }
};

foodItemSchema.index({ foodName: "text" });
foodItemSchema.index({ category: 1, isAvailable: 1 });
foodItemSchema.index({ averageRating: -1 });
foodItemSchema.index({ createdAt: -1 });

export default model("FoodItem", foodItemSchema);
