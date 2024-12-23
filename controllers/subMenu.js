import Joi from "joi";
import MyError from "../utils/error.js";
import prisma from "../utils/prismaClient.js";
import response from "../utils/response.js";

const subMenuCreateSchema = Joi.object({
  nameEn: Joi.string().required(),
  nameAr: Joi.string().required(),
  headingEn: Joi.string().allow("", null),
  headingAr: Joi.string().allow("", null),
  menuId: Joi.string().required(),
  pageId: Joi.string().allow(null, ""),
  externalUrl: Joi.string().uri().allow(null, ""),
}).custom((value, helpers) => {
  if (value.pageId && value.externalUrl) {
    return helpers.error("any.invalid", {
      message: "Cannot provide both pageId and externalUrl",
    });
  }
  if (!value.pageId && !value.externalUrl) {
    return helpers.error("any.invalid", {
      message: "Must provide either pageId or externalUrl",
    });
  }
  return value;
});

const subMenuUpdateSchema = Joi.object({
  nameEn: Joi.string().optional(),
  nameAr: Joi.string().optional(),
  headingEn: Joi.string().allow("", null).optional(),
  headingAr: Joi.string().allow("", null).optional(),
  menuId: Joi.string().optional(),
  pageId: Joi.string().allow(null, "").optional(),
  externalUrl: Joi.string().uri().allow(null, "").optional(),
})
  .custom((value, helpers) => {
    if (value.pageId && value.externalUrl) {
      return helpers.error("any.invalid", {
        message: "Cannot provide both pageId and externalUrl",
      });
    }
    return value;
  })
  .min(1);

class SubMenuController {
  static async createSubMenu(req, res, next) {
    try {
      const { error, value } = subMenuCreateSchema.validate(req.body);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      // Check if menu exists
      const menu = await prisma.menu.findUnique({
        where: { id: value.menuId },
      });

      if (!menu) {
        throw new MyError("Menu not found", 404);
      }

      // Check if page exists if pageId is provided
      if (value.pageId) {
        const page = await prisma.page.findUnique({
          where: { id: value.pageId },
        });

        if (!page) {
          throw new MyError("Page not found", 404);
        }
        // Clear externalUrl if pageId is provided
        value.externalUrl = null;
      }

      const subMenu = await prisma.subMenu.create({
        data: value,
        include: {
          menu: true,
          page: true,
        },
      });

      res
        .status(201)
        .json(response(201, true, "SubMenu created successfully", { subMenu }));
    } catch (error) {
      next(error);
    }
  }

  static async getSubMenus(req, res, next) {
    try {
      const { menuId, page, limit, search } = req.query;
      const where = menuId ? { menuId } : {};

      // Add search condition if search query exists
      if (search) {
        where.OR = [
          { nameEn: { contains: search } },
          { nameAr: { contains: search } },
        ];
      }

      // If pagination parameters are provided
      if (page && limit) {
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [subMenus, total] = await Promise.all([
          prisma.subMenu.findMany({
            where,
            include: {
              menu: true,
              page: true,
            },
            orderBy: {
              createdAt: "asc",
            },
            skip,
            take: parseInt(limit),
          }),
          prisma.subMenu.count({ where }),
        ]);

        const totalPages = Math.ceil(total / parseInt(limit));

        res.status(200).json(
          response(200, true, "SubMenus retrieved successfully", {
            subMenus,
            pagination: {
              total,
              page: parseInt(page),
              totalPages,
              limit: parseInt(limit),
            },
          })
        );
      } else {
        // Regular non-paginated response
        const subMenus = await prisma.subMenu.findMany({
          where,
          include: {
            menu: true,
            page: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        });

        res
          .status(200)
          .json(
            response(200, true, "SubMenus retrieved successfully", { subMenus })
          );
      }
    } catch (error) {
      next(error);
    }
  }

  static async getSubMenu(req, res, next) {
    try {
      const { id } = req.params;

      const subMenu = await prisma.subMenu.findUnique({
        where: { id },
        include: {
          menu: true,
        },
      });

      if (!subMenu) {
        throw new MyError("SubMenu not found", 404);
      }

      res
        .status(200)
        .json(
          response(200, true, "SubMenu retrieved successfully", { subMenu })
        );
    } catch (error) {
      next(error);
    }
  }

  static async updateSubMenu(req, res, next) {
    try {
      const { id } = req.params;
      const { error, value } = subMenuUpdateSchema.validate(req.body);

      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      // Check if submenu exists
      const existingSubMenu = await prisma.subMenu.findUnique({
        where: { id },
      });

      if (!existingSubMenu) {
        throw new MyError("SubMenu not found", 404);
      }

      // If menuId is being updated, verify the new menu exists
      if (value.menuId) {
        const menu = await prisma.menu.findUnique({
          where: { id: value.menuId },
        });

        if (!menu) {
          throw new MyError("New menu not found", 404);
        }
      }

      // If pageId is being updated, verify the new page exists
      if (value.pageId) {
        const page = await prisma.page.findUnique({
          where: { id: value.pageId },
        });

        if (!page) {
          throw new MyError("New page not found", 404);
        }
      }

      const subMenu = await prisma.subMenu.update({
        where: { id },
        data: value,
        include: {
          menu: true,
        },
      });

      res
        .status(200)
        .json(response(200, true, "SubMenu updated successfully", { subMenu }));
    } catch (error) {
      next(error);
    }
  }

  static async deleteSubMenu(req, res, next) {
    try {
      const { id } = req.params;

      await prisma.subMenu.delete({
        where: { id },
      });

      res
        .status(200)
        .json(response(200, true, "SubMenu deleted successfully", null));
    } catch (error) {
      next(error);
    }
  }
}

export default SubMenuController;
