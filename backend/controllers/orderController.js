import Order from "../models/Order.js";

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
  try {
    const { customerName, phoneNumber, items, estimatedDeliveryDate } = req.body;

    if (!customerName || !phoneNumber || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Customer name, phone number, and at least one item are required",
      });
    }

    const order = await Order.create({
      customerName,
      phoneNumber,
      items,
      estimatedDeliveryDate: estimatedDeliveryDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Default: 3 days from now
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Private
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    // Validate that status is a valid value
    if (!Order.STATUS_FLOW.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${Order.STATUS_FLOW.join(", ")}`,
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Validate status flow transition
    if (!Order.isValidTransition(order.status, status)) {
      const currentIndex = Order.STATUS_FLOW.indexOf(order.status);
      const nextStatus = Order.STATUS_FLOW[currentIndex + 1];
      return res.status(400).json({
        success: false,
        message: `Invalid status transition. Current status is "${order.status}". Next valid status is "${nextStatus || "N/A — already delivered"}".`,
      });
    }

    order.status = status;
    await order.save();

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all orders with filters
// @route   GET /api/orders
// @access  Private
export const getOrders = async (req, res) => {
  try {
    const { status, customerName, phoneNumber, garmentType, page = 1, limit = 20 } = req.query;

    const filter = {};

    // Filter by status
    if (status) {
      filter.status = status.toUpperCase();
    }

    // Filter by customer name (case-insensitive partial match)
    if (customerName) {
      filter.customerName = { $regex: customerName, $options: "i" };
    }

    // Filter by phone number (partial match)
    if (phoneNumber) {
      filter.phoneNumber = { $regex: phoneNumber, $options: "i" };
    }

    // Search by garment type within items array
    if (garmentType) {
      filter["items.garmentType"] = { $regex: garmentType, $options: "i" };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("createdBy", "username")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "createdBy",
      "username"
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/orders/dashboard
// @access  Private
export const getDashboard = async (req, res) => {
  try {
    const [totalOrders, totalRevenue, ordersPerStatus] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Order.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    // Format orders per status into a cleaner object
    const statusBreakdown = {};
    Order.STATUS_FLOW.forEach((s) => {
      statusBreakdown[s] = 0;
    });
    ordersPerStatus.forEach((item) => {
      statusBreakdown[item._id] = item.count;
    });

    res.status(200).json({
      success: true,
      data: {
        totalOrders,
        totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
        ordersPerStatus: statusBreakdown,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
