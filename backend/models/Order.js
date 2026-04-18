import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  garmentType: {
    type: String,
    required: [true, "Garment type is required"],
    trim: true,
  },
  quantity: {
    type: Number,
    required: [true, "Quantity is required"],
    min: [1, "Quantity must be at least 1"],
  },
  pricePerItem: {
    type: Number,
    required: [true, "Price per item is required"],
    min: [0, "Price cannot be negative"],
  },
  totalPrice: {
    type: Number,
    default: 0,
  },
});

// Auto-calculate totalPrice for each item
orderItemSchema.pre("validate", function (next) {
  this.totalPrice = this.quantity * this.pricePerItem;
  next();
});

const STATUS_FLOW = ["RECEIVED", "PROCESSING", "READY", "DELIVERED"];

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
    },
    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: (v) => v.length > 0,
        message: "At least one item is required",
      },
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: STATUS_FLOW,
      default: "RECEIVED",
    },
    estimatedDeliveryDate: {
      type: Date,
      required: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate orderId and calculate totalAmount
orderSchema.pre("save", async function (next) {
  // Generate order ID on creation
  if (this.isNew) {
    const count = await mongoose.model("Order").countDocuments();
    this.orderId = `ORD-${String(count + 1).padStart(5, "0")}`;
  }
  // Calculate total amount from items
  this.totalAmount = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
  next();
});

// Static: valid status transitions
orderSchema.statics.STATUS_FLOW = STATUS_FLOW;

orderSchema.statics.isValidTransition = function (currentStatus, newStatus) {
  const currentIndex = STATUS_FLOW.indexOf(currentStatus);
  const newIndex = STATUS_FLOW.indexOf(newStatus);
  // Only allow moving forward by exactly one step
  return newIndex === currentIndex + 1;
};

const Order = mongoose.model("Order", orderSchema);
export default Order;
