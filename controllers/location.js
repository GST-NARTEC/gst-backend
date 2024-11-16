import MyError from "../utils/error.js";
import prisma from "../utils/prismaClient.js";
import response from "../utils/response.js";

class LocationController {
  static async getCountries(req, res, next) {
    try {
      const countries = await prisma.country.findMany({
        where: {
          isActive: true,
        },
        select: {
          id: true,
          nameEn: true,
          nameAr: true,
        },
        orderBy: {
          nameEn: "asc",
        },
      });

      res.status(200).json(
        response(200, true, "Countries retrieved successfully", {
          countries,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  static async getRegions(req, res, next) {
    try {
      const { countryId } = req.query;

      if (!countryId) {
        throw new MyError("Country ID is required", 400);
      }

      const regions = await prisma.region.findMany({
        where: {
          countryId,
          isActive: true,
        },
        select: {
          id: true,
          nameEn: true,
          nameAr: true,
        },
        orderBy: {
          nameEn: "asc",
        },
      });

      res.status(200).json(
        response(200, true, "Regions retrieved successfully", {
          regions,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  static async getCities(req, res, next) {
    try {
      const { regionId } = req.query;

      if (!regionId) {
        throw new MyError("Region ID is required", 400);
      }

      const cities = await prisma.city.findMany({
        where: {
          regionId,
          isActive: true,
        },
        select: {
          id: true,
          nameEn: true,
          nameAr: true,
          telCode: true,
        },
        orderBy: {
          nameEn: "asc",
        },
      });

      res.status(200).json(
        response(200, true, "Cities retrieved successfully", {
          cities,
        })
      );
    } catch (error) {
      next(error);
    }
  }
}

export default LocationController;
