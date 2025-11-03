// models/Category.js
import { Schema, model } from "mongoose";

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
    },
    productCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

categorySchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  }
  next();
});

categorySchema.virtual("isPopular").get(function () {
  return this.productCount > 10; // Adjust threshold as needed
});

categorySchema.methods.incrementProductCount = function () {
  this.productCount += 1;
  return this.save();
};

categorySchema.methods.decrementProductCount = function () {
  this.productCount = Math.max(0, this.productCount - 1);
  return this.save();
};

categorySchema.set("toJSON", { virtuals: true });

export default model("Category", categorySchema);
