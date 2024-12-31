import prisma from "../utils/prismaClient.js";
import response from "../utils/response.js";

class DashboardController {
  static async getDashboardStats(req, res, next) {
    try {
      const userId = req.user.id;

      // Get order counts
      const orderCounts = await prisma.order.groupBy({
        by: ["status"],
        where: {
          userId: userId,
        },
        _count: {
          id: true,
        },
      });

      // Transform order counts
      const orderStats = {
        activated: 0,
        pending: 0,
      };

      orderCounts.forEach((count) => {
        if (count.status === "Activated") {
          orderStats.activated = count._count.id;
        } else {
          orderStats.pending += count._count.id;
        }
      });

      // use order to get assigned gtins of specific user
      const order = await prisma.order.findFirst({
        where: {
          userId: userId,
        },
        include: {
          assignedGtins: {
            include: {
              gtin: {
                select: {
                  status: true,
                },
              },
            },
          },
        },
      });

      // Transform GTIN counts
      const gtinCounts = {
        available: 0,
        sold: 0,
        used: 0,
      };

      order.assignedGtins.forEach((assignedGtin) => {
        switch (assignedGtin.gtin.status) {
          case "Available":
            gtinCounts.available += 1;
            break;
          case "Sold":
            gtinCounts.sold += 1;
            break;
          case "Used":
            gtinCounts.used += 1;
            break;
        }
      });

      return res.json(
        response(200, true, "Dashboard stats retrieved successfully", {
          orders: orderStats,
          gtins: gtinCounts,
        })
      );
    } catch (error) {
      next(error);
    }
  }
}

export default DashboardController;
