import { Schema, model } from "mongoose";

const orderItemSchema = new Schema(
  {
    foodItem: {
      type: Schema.Types.ObjectId,
      ref: "FoodItem",
      required: true,
    },
    foodName: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
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
    subtotal: {
      type: Number,
      required: true,
    },
  },
  { _id: true }
);

const shippingAddressSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    postalCode: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
      default: "Bangladesh",
    },
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    items: [orderItemSchema],
    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cash_on_delivery", "card", "mobile_banking"],
      default: "cash_on_delivery",
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
      index: true,
    },
    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "preparing",
        "ready_for_delivery",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      default: "pending",
      index: true,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    tax: {
      type: Number,
      required: true,
      min: 0,
    },
    deliveryFee: {
      type: Number,
      required: true,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    totalItems: {
      type: Number,
      required: true,
      min: 1,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    statusHistory: [
      {
        status: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        updatedBy: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        note: String,
      },
    ],
    estimatedDeliveryTime: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
    cancellationReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.pre("save", async function (next) {
  if (this.isNew && !this.orderNumber) {
    try {
      const date = new Date();
      const year = date.getFullYear().toString().slice(-2);
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const count = await this.constructor.countDocuments({
        createdAt: { $gte: todayStart, $lte: todayEnd },
      });

      this.orderNumber = `ORD${year}${month}${day}${(count + 1)
        .toString()
        .padStart(4, "0")}`;

      if (!this.statusHistory || this.statusHistory.length === 0) {
        this.statusHistory.push({
          status: this.orderStatus,
          timestamp: new Date(),
        });
      }
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Update status with history tracking
orderSchema.methods.updateStatus = function (newStatus, updatedBy, note = "") {
  this.orderStatus = newStatus;
  this.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    updatedBy,
    note,
  });

  // Set specific timestamps
  if (newStatus === "delivered") {
    this.deliveredAt = new Date();
  } else if (newStatus === "cancelled") {
    this.cancelledAt = new Date();
  }

  return this.save();
};

// Cancel order
orderSchema.methods.cancelOrder = function (reason, cancelledBy) {
  this.orderStatus = "cancelled";
  this.cancelledAt = new Date();
  this.cancellationReason = reason;
  this.statusHistory.push({
    status: "cancelled",
    timestamp: new Date(),
    updatedBy: cancelledBy,
    note: reason,
  });

  return this.save();
};

orderSchema.index({ orderNumber: 1 });
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });

export default model("Order", orderSchema);
