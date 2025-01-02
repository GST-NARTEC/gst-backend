import prisma from "../utils/prismaClient.js";
import response from "../utils/response.js";

class DashboardController {
  static async getDashboardStats(req, res, next) {
    try {
      const userId = req.user.id;

      // Get all required data in parallel
      const [orderCounts, brandCount, products, orders] = await Promise.all([
        // Existing order counts query
        prisma.order.groupBy({
          by: ["status"],
          where: { userId },
          _count: { id: true },
        }),

        // Get total brands count
        prisma.brand.count({
          where: { userId },
        }),

        // Get all user products
        prisma.userProduct.findMany({
          where: { userId },
          select: {
            gtin: true,
            isSec: true,
          },
        }),

        // Get all orders with assigned GTINs for barcode type counting
        prisma.order.findMany({
          where: { userId },
          include: {
            assignedGtins: {
              include: {
                barcodeType: true,
                gtin: true,
              },
            },
          },
        }),
      ]);

      // Transform order counts (existing code)
      const orderStats = {
        activated: 0,
        pending: 0,
        total: 0,
      };

      orderCounts.forEach((count) => {
        if (count.status === "Activated") {
          orderStats.activated = count._count.id;
        } else {
          orderStats.pending += count._count.id;
        }
      });
      orderStats.total = orderStats.activated + orderStats.pending;

      // Count products by barcode type
      const productTypeStats = {};
      const barcodeTypes = {};

      // Process orders to get GTIN status by barcode type
      orders.forEach((order) => {
        order.assignedGtins.forEach((assignedGtin) => {
          const type = assignedGtin.barcodeType?.type || "Unknown";

          if (!barcodeTypes[type]) {
            barcodeTypes[type] = {
              total: 0,
              used: 0,
              available: 0,
              sold: 0,
            };
          }

          barcodeTypes[type].total += 1;

          switch (assignedGtin.gtin.status) {
            case "Used":
              barcodeTypes[type].used += 1;
              break;
            case "Available":
              barcodeTypes[type].available += 1;
              break;
            case "Sold":
              barcodeTypes[type].sold += 1;
              break;
          }
        });
      });

      // Count products by type
      products.forEach((product) => {
        if (product.isSec) {
          productTypeStats.SEC = (productTypeStats.SEC || 0) + 1;
        } else {
          // Find barcode type based on GTIN
          const assignedGtin = orders
            .flatMap((o) => o.assignedGtins)
            .find((ag) => ag.gtin.gtin === product.gtin);

          if (assignedGtin?.barcodeType?.type) {
            const type = assignedGtin.barcodeType.type;
            productTypeStats[type] = (productTypeStats[type] || 0) + 1;
          }
        }
      });

      return res.json(
        response(200, true, "Dashboard stats retrieved successfully", {
          orders: orderStats,
          brands: {
            total: brandCount,
          },
          products: {
            byType: productTypeStats,
            total: products.length,
          },
          barcodeTypes: barcodeTypes,
        })
      );
    } catch (error) {
      next(error);
    }
  }
}

export default DashboardController;
