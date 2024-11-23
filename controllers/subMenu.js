import Joi from "joi";
import MyError from "../utils/error.js";
import prisma from "../utils/prismaClient.js";
import response from "../utils/response.js";

const subMenuSchema = Joi.object({
  nameEn: Joi.string().required(),
  nameAr: Joi.string().required(),
  headingEn: Joi.string().required(),
  headingAr: Joi.string().required(),
  menuId: Joi.string().required(),
});

class SubMenuController {
  static async createSubMenu(req, res, next) {
    try {
      const { error, value } = subMenuSchema.validate(req.body);
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

      const subMenu = await prisma.subMenu.create({
        data: value,
        include: {
          menu: true,
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
      const { menuId } = req.query;

      const whereClause = menuId ? { menuId } : {};

      const subMenus = await prisma.subMenu.findMany({
        where: whereClause,
        include: {
          menu: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      res
        .status(200)
        .json(
          response(200, true, "SubMenus retrieved successfully", { subMenus })
        );
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
      const { error, value } = subMenuSchema.validate(req.body);

      if (error) {
        throw new MyError(error.details[0].message, 400);
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
