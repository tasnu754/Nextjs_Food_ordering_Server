import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import FoodItem from "../models/foodItem.model.js";

export const getAdminStats = async (req, res) => {
  try {
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const totalOrders = await Order.countDocuments();

    const revenueResult = await Order.aggregate([
      { $match: { orderStatus: { $ne: "cancelled" } } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const activeUsers = await User.countDocuments({
      lastLoginAt: { $gte: thirtyDaysAgo },
    });

    const totalFoodItems = await FoodItem.countDocuments();

    const weeklyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
          orderStatus: { $ne: "cancelled" },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$total" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const weeklyOrders = await Order.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const formattedRevenue = [];
    const formattedOrders = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split("T")[0];
      const dayName = days[date.getDay()];

      const revenueData = weeklyRevenue.find((d) => d._id === dateStr);
      const orderData = weeklyOrders.find((d) => d._id === dateStr);

      formattedRevenue.push({
        day: dayName,
        value: revenueData ? Math.round(revenueData.revenue) : 0,
      });

      formattedOrders.push({
        day: dayName,
        value: orderData ? orderData.count : 0,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalOrders,
          totalRevenue: Math.round(totalRevenue),
          activeUsers,
          totalFoodItems,
        },
        charts: {
          revenue: formattedRevenue,
          orders: formattedOrders,
        },
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard statistics",
      error: error.message,
    });
  }
};

export const getRecentActivities = async (req, res) => {
  try {
    const activities = [];

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("orderNumber orderStatus createdAt");

    recentOrders.forEach((order) => {
      activities.push({
        type: "order",
        message: `New order #${order.orderNumber} received`,
        time: order.createdAt,
        icon: "🛒",
        color: "green",
      });
    });

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .select("name createdAt");

    recentUsers.forEach((user) => {
      activities.push({
        type: "user",
        message: `New user ${user.name} registered`,
        time: user.createdAt,
        icon: "👤",
        color: "blue",
      });
    });

    const deliveredOrders = await Order.find({ orderStatus: "delivered" })
      .sort({ deliveredAt: -1 })
      .limit(3)
      .select("orderNumber deliveredAt");

    deliveredOrders.forEach((order) => {
      activities.push({
        type: "delivery",
        message: `Order #${order.orderNumber} delivered`,
        time: order.deliveredAt,
        icon: "✅",
        color: "green",
      });
    });

    const recentReviews = await FoodItem.find({
      "reviews.0": { $exists: true },
    })
      .sort({ "reviews.createdAt": -1 })
      .limit(3)
      .select("foodName reviews");

    recentReviews.forEach((item) => {
      if (item.reviews.length > 0) {
        const latestReview = item.reviews[item.reviews.length - 1];
        activities.push({
          type: "review",
          message: `New ${latestReview.stars}-star review on ${item.foodName}`,
          time: latestReview.createdAt,
          icon: "⭐",
          color: "yellow",
        });
      }
    });

    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    const limitedActivities = activities.slice(0, 10);

    const formattedActivities = limitedActivities.map((activity) => {
      const timeDiff = Date.now() - new Date(activity.time).getTime();
      const minutes = Math.floor(timeDiff / 60000);
      const hours = Math.floor(timeDiff / 3600000);
      const days = Math.floor(timeDiff / 86400000);

      let timeStr;
      if (minutes < 1) timeStr = "Just now";
      else if (minutes < 60) timeStr = `${minutes} min ago`;
      else if (hours < 24) timeStr = `${hours} hour${hours > 1 ? "s" : ""} ago`;
      else timeStr = `${days} day${days > 1 ? "s" : ""} ago`;

      return {
        ...activity,
        time: timeStr,
      };
    });

    res.status(200).json({
      success: true,
      data: formattedActivities,
    });
  } catch (error) {
    console.error("Recent activities error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching recent activities",
      error: error.message,
    });
  }
};
