import Joi from "joi";
import MyError from "../utils/error.js";
import prisma from "../utils/prismaClient.js";
import response from "../utils/response.js";

const localizationSchema = Joi.object({
  key: Joi.string().required(),
  valueEn: Joi.string().required(),
  valueAr: Joi.string().required(),
});

const querySchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  search: Joi.string().allow("", null),
});

class LocalizationController {
  static async createLocalization(req, res, next) {
    try {
      const { error, value } = localizationSchema.validate(req.body);
      if (error) {
        throw new MyError(error.message, 400);
      }

      const localization = await prisma.localization.create({
        data: value,
      });

      res
        .status(201)
        .json(response(201, true, "Localization created", localization));
    } catch (error) {
      next(error);
    }
  }

  static async getLocalizations(req, res, next) {
    try {
      const { error, value } = querySchema.validate(req.query);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const { page, limit, search } = value;
      const skip = (page - 1) * limit;

      const where = {};
      if (search) {
        where.OR = [
          { key: { contains: search } },
          { valueEn: { contains: search } },
          { valueAr: { contains: search } },
        ];
      }

      const [localizations, total] = await Promise.all([
        prisma.localization.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.localization.count({ where }),
      ]);

      res.json(
        response(200, true, "Localizations fetched", {
          data: localizations,
          meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        })
      );
    } catch (error) {
      next(error);
    }
  }

  static async getAllLocalizations(req, res, next) {
    try {
      const localizations = await prisma.localization.findMany({
        select: {
          key: true,
          valueEn: true,
          valueAr: true,
        },
      });

      const formattedEn = localizations.reduce((acc, item) => {
        acc[item.key] = item.valueEn;
        return acc;
      }, {});

      const formattedAr = localizations.reduce((acc, item) => {
        acc[item.key] = item.valueAr;
        return acc;
      }, {});

      res.json(
        response(200, true, "Localizations fetched", {
          en: { translation: formattedEn },
          ar: { translation: formattedAr },
        })
      );
    } catch (error) {
      next(error);
    }
  }

  static async updateLocalization(req, res, next) {
    try {
      const { error, value } = localizationSchema.validate(req.body);
      if (error) {
        throw new MyError(error.message, 400);
      }

      const word = await prisma.localization.findFirst({
        where: { key: value.key },
      });

      const localization = await prisma.localization.update({
        where: { id: word.id },
        data: {
          valueEn: value.valueEn,
          valueAr: value.valueAr,
        },
      });

      res.json(response(200, true, "Localization updated", localization));
    } catch (error) {
      next(error);
    }
  }

  static async deleteLocalization(req, res, next) {
    try {
      const { id } = req.params;
      await prisma.localization.delete({
        where: { id },
      });

      res.json(response(200, true, "Localization deleted", null));
    } catch (error) {
      next(error);
    }
  }
}

export default LocalizationController;
