import Joi from "joi";
import MyError from "../utils/error.js";
import prisma from "../utils/prismaClient.js";
import response from "../utils/response.js";

// Validation schemas
const overviewQuerySchema = Joi.object({
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  period: Joi.string().valid("today", "weekly", "monthly", "yearly", "custom").default("monthly"),
  orderStatus: Joi.string().valid("all", "Activated", "Pending Payment", "Pending Account Activation").default("all"),
  paymentType: Joi.string().valid("all", "Bank Transfer", "Online").default("all"),
});

const trendsQuerySchema = Joi.object({
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  period: Joi.string().valid("today", "weekly", "monthly", "yearly").default("monthly"),
  groupBy: Joi.string().valid("hour", "day", "week", "month").default("day"),
});

const membersQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().optional().allow(""),
  orderStatus: Joi.string().valid("all", "Activated", "Pending Payment", "Pending Account Activation").default("all"),
  isActive: Joi.string().valid("all", "true", "false").default("all"),
  sortBy: Joi.string().valid("createdAt", "companyNameEn", "email").default("createdAt"),
  sortOrder: Joi.string().valid("asc", "desc").default("desc"),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
});

// Helper function to get date range based on period
const getDateRange = (period, startDate, endDate) => {
  const now = new Date();
  let start, end;

  switch (period) {
    case "today":
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      break;
    case "weekly":
      start = new Date(now);
      start.setDate(now.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      break;
    case "monthly":
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      break;
    case "yearly":
      start = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      break;
    case "custom":
      start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
      end = endDate ? new Date(endDate) : now;
      break;
    default:
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      end = now;
  }

  return { start, end };
};

// Helper function to get previous period range for comparison
const getPreviousPeriodRange = (period, currentStart, currentEnd) => {
  const duration = currentEnd.getTime() - currentStart.getTime();
  const previousEnd = new Date(currentStart.getTime() - 1);
  const previousStart = new Date(previousEnd.getTime() - duration);

  return { start: previousStart, end: previousEnd };
};

// Helper function to calculate percentage change
const calculateChange = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

class KPIController {
  /**
   * Get KPI Overview Statistics
   * GET /api/v1/kpi/overview
   */
  static async getOverview(req, res, next) {
    try {
      const { error, value } = overviewQuerySchema.validate(req.query);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const { period, startDate, endDate, orderStatus, paymentType } = value;
      const { start, end } = getDateRange(period, startDate, endDate);
      const { start: prevStart, end: prevEnd } = getPreviousPeriodRange(period, start, end);

      // Build order where clause
      const orderWhereBase = {
        createdAt: { gte: start, lte: end },
      };

      if (orderStatus !== "all") {
        orderWhereBase.status = orderStatus;
      }

      if (paymentType !== "all") {
        if (paymentType === "Online") {
          orderWhereBase.paymentType = { not: "Bank Transfer" };
        } else {
          orderWhereBase.paymentType = "Bank Transfer";
        }
      }

      // Previous period order where clause
      const prevOrderWhereBase = {
        ...orderWhereBase,
        createdAt: { gte: prevStart, lte: prevEnd },
      };

      // Execute all queries in parallel for performance
      const [
        // Current period stats
        totalUsers,
        activeUsers,
        inactiveUsers,
        newUsers,
        totalOrders,
        activatedOrders,
        pendingPaymentOrders,
        pendingActivationOrders,
        revenueData,
        bankOrders,
        onlineOrders,
        // Previous period stats for comparison
        prevNewUsers,
        prevTotalOrders,
        prevActivatedOrders,
        prevRevenueData,
      ] = await Promise.all([
        // User counts
        prisma.user.count({ where: { isDeleted: false } }),
        prisma.user.count({ where: { isActive: true, isDeleted: false } }),
        prisma.user.count({ where: { isActive: false, isDeleted: false } }),
        prisma.user.count({
          where: {
            isDeleted: false,
            createdAt: { gte: start, lte: end },
          },
        }),

        // Order counts (current period)
        prisma.order.count({ where: orderWhereBase }),
        prisma.order.count({
          where: { ...orderWhereBase, status: "Activated" },
        }),
        prisma.order.count({
          where: { ...orderWhereBase, status: "Pending Payment" },
        }),
        prisma.order.count({
          where: { ...orderWhereBase, status: "Pending Account Activation" },
        }),

        // Revenue (sum of overallAmount for Activated orders)
        prisma.order.aggregate({
          where: { ...orderWhereBase, status: "Activated" },
          _sum: { overallAmount: true },
        }),

        // Order counts by payment type
        prisma.order.count({
          where: { ...orderWhereBase, paymentType: "Bank Transfer" },
        }),
        prisma.order.count({
          where: { ...orderWhereBase, paymentType: { not: "Bank Transfer" } },
        }),

        // Previous period comparisons
        prisma.user.count({
          where: {
            isDeleted: false,
            createdAt: { gte: prevStart, lte: prevEnd },
          },
        }),
        prisma.order.count({
          where: prevOrderWhereBase,
        }),
        prisma.order.count({
          where: { ...prevOrderWhereBase, status: "Activated" },
        }),
        prisma.order.aggregate({
          where: { ...prevOrderWhereBase, status: "Activated" },
          _sum: { overallAmount: true },
        }),
      ]);

      const currentRevenue = revenueData._sum.overallAmount || 0;
      const previousRevenue = prevRevenueData._sum.overallAmount || 0;

      // Calculate changes
      const revenueChange = calculateChange(currentRevenue, previousRevenue);
      const ordersChange = calculateChange(totalOrders, prevTotalOrders);
      const activatedChange = calculateChange(activatedOrders, prevActivatedOrders);
      const newUsersChange = calculateChange(newUsers, prevNewUsers);

      const stats = {
        users: {
          total: totalUsers,
          active: activeUsers,
          inactive: inactiveUsers,
          new: newUsers,
          newChange: newUsersChange,
        },
        orders: {
          total: totalOrders,
          activated: activatedOrders,
          pendingPayment: pendingPaymentOrders,
          pendingActivation: pendingActivationOrders,
          byPaymentType: {
            bank: bankOrders,
            online: onlineOrders,
          },
          change: ordersChange,
          activatedChange: activatedChange,
        },
        revenue: {
          total: currentRevenue,
          formatted: `${currentRevenue.toLocaleString()} SAR`,
          change: revenueChange,
          previousTotal: previousRevenue,
        },
        period: {
          type: period,
          start: start.toISOString(),
          end: end.toISOString(),
        },
      };

      res.status(200).json(
        response(200, true, "KPI overview retrieved successfully", stats)
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Revenue Trends for Charts
   * GET /api/v1/kpi/revenue-trends
   */
  static async getRevenueTrends(req, res, next) {
    try {
      const { error, value } = trendsQuerySchema.validate(req.query);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const { period, startDate, endDate, groupBy } = value;
      const { start, end } = getDateRange(period, startDate, endDate);

      // Get all activated orders within the date range
      const orders = await prisma.order.findMany({
        where: {
          createdAt: { gte: start, lte: end },
        },
        select: {
          createdAt: true,
          overallAmount: true,
          status: true,
        },
        orderBy: { createdAt: "asc" },
      });

      // Group data based on groupBy parameter
      const groupedData = {};

      orders.forEach((order) => {
        let key;
        const date = new Date(order.createdAt);

        switch (groupBy) {
          case "hour":
            key = `${date.getHours().toString().padStart(2, "0")}:00`;
            break;
          case "day":
            key = date.toLocaleDateString("en-US", { weekday: "short" });
            break;
          case "week":
            const weekNum = Math.ceil(date.getDate() / 7);
            key = `Week ${weekNum}`;
            break;
          case "month":
            key = date.toLocaleDateString("en-US", { month: "short" });
            break;
          default:
            key = date.toISOString().split("T")[0];
        }

        if (!groupedData[key]) {
          groupedData[key] = {
            name: key,
            activated: 0,
            pending: 0,
            activatedCount: 0,
            pendingCount: 0,
          };
        }

        if (order.status === "Activated") {
          groupedData[key].activated += order.overallAmount;
          groupedData[key].activatedCount += 1;
        } else {
          groupedData[key].pending += order.overallAmount;
          groupedData[key].pendingCount += 1;
        }
      });

      // Convert to array and ensure proper ordering
      let chartData = Object.values(groupedData);

      // Sort based on groupBy type
      if (groupBy === "hour") {
        chartData.sort((a, b) => parseInt(a.name) - parseInt(b.name));
      } else if (groupBy === "week") {
        chartData.sort((a, b) => {
          const weekA = parseInt(a.name.replace("Week ", ""));
          const weekB = parseInt(b.name.replace("Week ", ""));
          return weekA - weekB;
        });
      }

      // Round amounts for cleaner display
      chartData = chartData.map((item) => ({
        ...item,
        activated: Math.round(item.activated * 100) / 100,
        pending: Math.round(item.pending * 100) / 100,
      }));

      res.status(200).json(
        response(200, true, "Revenue trends retrieved successfully", {
          chartData,
          period: {
            type: period,
            groupBy,
            start: start.toISOString(),
            end: end.toISOString(),
          },
          summary: {
            totalActivated: chartData.reduce((sum, item) => sum + item.activated, 0),
            totalPending: chartData.reduce((sum, item) => sum + item.pending, 0),
            totalActivatedCount: chartData.reduce((sum, item) => sum + item.activatedCount, 0),
            totalPendingCount: chartData.reduce((sum, item) => sum + item.pendingCount, 0),
          },
        })
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Members List with Order Statistics
   * GET /api/v1/kpi/members
   */
  static async getMembers(req, res, next) {
    try {
      const { error, value } = membersQuerySchema.validate(req.query);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const {
        page,
        limit,
        search,
        orderStatus,
        isActive,
        sortBy,
        sortOrder,
        startDate,
        endDate,
      } = value;

      const skip = (page - 1) * limit;

      // Build where clause
      const whereClause = {
        isDeleted: false,
      };

      // Search filter
      if (search && search.trim()) {
        whereClause.OR = [
          { email: { contains: search } },
          { companyNameEn: { contains: search } },
          { companyNameAr: { contains: search } },
          { companyLicenseNo: { contains: search } },
          { country: { contains: search } },
        ];
      }

      // Active status filter
      if (isActive !== "all") {
        whereClause.isActive = isActive === "true";
      }

      // Date range filter
      if (startDate || endDate) {
        whereClause.createdAt = {};
        if (startDate) {
          whereClause.createdAt.gte = new Date(startDate);
        }
        if (endDate) {
          whereClause.createdAt.lte = new Date(endDate);
        }
      }

      // Order status filter - we need to filter users who have orders with specific status
      if (orderStatus !== "all") {
        whereClause.orders = {
          some: {
            status: orderStatus,
          },
        };
      }

      // Execute queries in parallel
      const [members, total] = await Promise.all([
        prisma.user.findMany({
          where: whereClause,
          select: {
            id: true,
            email: true,
            companyNameEn: true,
            companyNameAr: true,
            mobile: true,
            companyLicenseNo: true,
            country: true,
            isActive: true,
            createdAt: true,
            orders: {
              select: {
                id: true,
                status: true,
                overallAmount: true,
                createdAt: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: {
            [sortBy]: sortOrder,
          },
        }),
        prisma.user.count({ where: whereClause }),
      ]);

      // Transform members data with order statistics
      const transformedMembers = members.map((member) => {
        const orderStats = {
          total: member.orders.length,
          activated: member.orders.filter((o) => o.status === "Activated").length,
          pendingPayment: member.orders.filter((o) => o.status === "Pending Payment").length,
          pendingActivation: member.orders.filter((o) => o.status === "Pending Account Activation").length,
          totalRevenue: member.orders
            .filter((o) => o.status === "Activated")
            .reduce((sum, o) => sum + o.overallAmount, 0),
        };

        return {
          id: member.id,
          companyNameEn: member.companyNameEn,
          companyNameAr: member.companyNameAr,
          email: member.email,
          mobile: member.mobile,
          companyLicenseNo: member.companyLicenseNo,
          country: member.country,
          isActive: member.isActive,
          createdAt: member.createdAt,
          orders: member.orders.map((o) => ({ status: o.status })),
          orderStats,
        };
      });

      const totalPages = Math.ceil(total / limit);

      res.status(200).json(
        response(200, true, "Members retrieved successfully", {
          members: transformedMembers,
          pagination: {
            total,
            page,
            limit,
            totalPages,
            hasMore: page < totalPages,
          },
        })
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Quick Stats for Dashboard Cards
   * GET /api/v1/kpi/quick-stats
   */
  static async getQuickStats(req, res, next) {
    try {
      const { period = "monthly" } = req.query;
      const { start, end } = getDateRange(period);
      const { start: prevStart, end: prevEnd } = getPreviousPeriodRange(period, start, end);

      const [
        // Current period
        currentRevenue,
        currentNewOrders,
        currentActivatedMembers,
        // Previous period
        previousRevenue,
        previousNewOrders,
        previousActivatedMembers,
      ] = await Promise.all([
        // Current period revenue
        prisma.order.aggregate({
          where: {
            status: "Activated",
            createdAt: { gte: start, lte: end },
          },
          _sum: { overallAmount: true },
        }),
        // Current period new orders
        prisma.order.count({
          where: {
            createdAt: { gte: start, lte: end },
          },
        }),
        // Current period activated members (users with activated orders)
        prisma.user.count({
          where: {
            isDeleted: false,
            orders: {
              some: {
                status: "Activated",
                createdAt: { gte: start, lte: end },
              },
            },
          },
        }),
        // Previous period
        prisma.order.aggregate({
          where: {
            status: "Activated",
            createdAt: { gte: prevStart, lte: prevEnd },
          },
          _sum: { overallAmount: true },
        }),
        prisma.order.count({
          where: {
            createdAt: { gte: prevStart, lte: prevEnd },
          },
        }),
        prisma.user.count({
          where: {
            isDeleted: false,
            orders: {
              some: {
                status: "Activated",
                createdAt: { gte: prevStart, lte: prevEnd },
              },
            },
          },
        }),
      ]);

      const currRev = currentRevenue._sum.overallAmount || 0;
      const prevRev = previousRevenue._sum.overallAmount || 0;

      const stats = [
        {
          title: "Total Approved Amount",
          value: `${currRev.toLocaleString()} SAR`,
          rawValue: currRev,
          change: calculateChange(currRev, prevRev),
          changeLabel: `${calculateChange(currRev, prevRev)}% from last ${period === "monthly" ? "month" : period === "weekly" ? "week" : "period"}`,
          icon: "chart",
          color: "blue",
        },
        {
          title: "New Orders",
          value: currentNewOrders.toString(),
          rawValue: currentNewOrders,
          change: calculateChange(currentNewOrders, previousNewOrders),
          changeLabel: `${Math.abs(currentNewOrders - previousNewOrders)} from last ${period === "monthly" ? "month" : period === "weekly" ? "week" : "period"}`,
          icon: "cart",
          color: "green",
        },
        {
          title: "Members Activated",
          value: currentActivatedMembers.toString(),
          rawValue: currentActivatedMembers,
          change: calculateChange(currentActivatedMembers, previousActivatedMembers),
          changeLabel: `${Math.abs(currentActivatedMembers - previousActivatedMembers)} from last ${period === "monthly" ? "month" : period === "weekly" ? "week" : "period"}`,
          icon: "users",
          color: "purple",
        },
      ];

      res.status(200).json(
        response(200, true, "Quick stats retrieved successfully", {
          stats,
          period: {
            type: period,
            start: start.toISOString(),
            end: end.toISOString(),
          },
        })
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Top Products
   * GET /api/v1/kpi/top-products
   */
  static async getTopProducts(req, res, next) {
    try {
      const { limit = 5, period = "monthly" } = req.query;
      const { start, end } = getDateRange(period);

      // Get top sold products
      const topProducts = await prisma.orderItem.groupBy({
        by: ["productId"],
        where: {
          order: {
            createdAt: { gte: start, lte: end },
          },
        },
        _sum: { quantity: true },
        _count: { id: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: parseInt(limit),
      });

      // Get product details
      const productIds = topProducts.map((p) => p.productId);
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: {
          id: true,
          title: true,
          price: true,
        },
      });

      // Combine data
      const result = topProducts.map((tp) => {
        const product = products.find((p) => p.id === tp.productId);
        return {
          productId: tp.productId,
          title: product?.title || "Unknown Product",
          price: product?.price || 0,
          totalQuantitySold: tp._sum.quantity,
          orderCount: tp._count.id,
          totalRevenue: (product?.price || 0) * (tp._sum.quantity || 0),
        };
      });

      res.status(200).json(
        response(200, true, "Top products retrieved successfully", {
          products: result,
          period: {
            type: period,
            start: start.toISOString(),
            end: end.toISOString(),
          },
        })
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Export KPI Data
   * GET /api/v1/kpi/export
   */
  static async exportData(req, res, next) {
    try {
      const { period = "monthly", format = "json" } = req.query;
      const { start, end } = getDateRange(period);

      // Get comprehensive data for export
      const [orders, users] = await Promise.all([
        prisma.order.findMany({
          where: {
            createdAt: { gte: start, lte: end },
          },
          include: {
            user: {
              select: {
                email: true,
                companyNameEn: true,
                companyNameAr: true,
              },
            },
            orderItems: {
              include: {
                product: {
                  select: { title: true, price: true },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.user.findMany({
          where: {
            isDeleted: false,
            createdAt: { gte: start, lte: end },
          },
          select: {
            id: true,
            email: true,
            companyNameEn: true,
            companyNameAr: true,
            country: true,
            isActive: true,
            createdAt: true,
          },
        }),
      ]);

      // Transform for export
      const exportData = {
        generatedAt: new Date().toISOString(),
        period: { type: period, start: start.toISOString(), end: end.toISOString() },
        summary: {
          totalOrders: orders.length,
          totalRevenue: orders
            .filter((o) => o.status === "Activated")
            .reduce((sum, o) => sum + o.overallAmount, 0),
          totalNewUsers: users.length,
        },
        orders: orders.map((o) => ({
          orderNumber: o.orderNumber,
          status: o.status,
          paymentType: o.paymentType,
          totalAmount: o.totalAmount,
          vat: o.vat,
          overallAmount: o.overallAmount,
          userEmail: o.user?.email,
          companyName: o.user?.companyNameEn,
          createdAt: o.createdAt,
          items: o.orderItems.map((item) => ({
            product: item.product?.title,
            quantity: item.quantity,
            price: item.price,
          })),
        })),
        users: users,
      };

      res.status(200).json(
        response(200, true, "Export data retrieved successfully", exportData)
      );
    } catch (error) {
      next(error);
    }
  }
}

export default KPIController;
