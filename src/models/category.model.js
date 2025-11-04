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
    itemCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    image: {
      url: {
        type: String,
        default: null,
      },
      publicId: {
        type: String,
        default: null,
      },
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
  return this.itemCount > 7;
});

categorySchema.methods.incrementItemCount = function () {
  this.itemCount += 1;
  return this.save();
};

categorySchema.methods.decrementItemCount = function () {
  this.itemCount = Math.max(0, this.itemCount - 1);
  return this.save();
};

categorySchema.set("toJSON", { virtuals: true });

export default model("Category", categorySchema);
