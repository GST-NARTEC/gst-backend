import companySchema from "../schemas/company.schemas.js";
import MyError from "../utils/error.js";
import { addDomain, deleteFile } from "../utils/file.js";
import prisma from "../utils/prismaClient.js";
import response from "../utils/response.js";

class CompanyController {
  static async createCompany(req, res, next) {
    let iconPath;
    try {
      const { error, value } = companySchema.validate(req.body);
      if (error) throw new MyError(error.details[0].message, 400);

      if (req.file) {
        iconPath = addDomain(req.file.path);
        value.icon = iconPath;
      }

      const company = await prisma.company.create({ data: value });
      res
        .status(201)
        .json(response(201, true, "Company created successfully", { company }));
    } catch (err) {
      if (iconPath) await deleteFile(iconPath);
      next(err);
    }
  }

  static async getCompanies(req, res, next) {
    try {
      const companies = await prisma.company.findMany({
        orderBy: { createdAt: "asc" },
      });
      res
        .status(200)
        .json(
          response(200, true, "Companies retrieved successfully", { companies })
        );
    } catch (err) {
      next(err);
    }
  }

  static async getCompany(req, res, next) {
    try {
      const { id } = req.params;
      const company = await prisma.company.findUnique({ where: { id } });
      if (!company) throw new MyError("Company not found", 404);
      res
        .status(200)
        .json(
          response(200, true, "Company retrieved successfully", { company })
        );
    } catch (err) {
      next(err);
    }
  }

  static async updateCompany(req, res, next) {
    let iconPath;
    try {
      const { id } = req.params;
      const { error, value } = companySchema.validate(req.body);
      if (error) throw new MyError(error.details[0].message, 400);

      const existing = await prisma.company.findUnique({ where: { id } });
      if (!existing) throw new MyError("Company not found", 404);

      if (req.file) {
        iconPath = addDomain(req.file.path);
        if (existing.icon) await deleteFile(existing.icon);
        value.icon = iconPath;
      }

      const company = await prisma.company.update({
        where: { id },
        data: value,
      });
      res
        .status(200)
        .json(response(200, true, "Company updated successfully", { company }));
    } catch (err) {
      if (iconPath) await deleteFile(iconPath);
      next(err);
    }
  }

  static async deleteCompany(req, res, next) {
    try {
      const { id } = req.params;
      const company = await prisma.company.findUnique({ where: { id } });
      if (!company) throw new MyError("Company not found", 404);

      if (company.icon) await deleteFile(company.icon);
      await prisma.company.delete({ where: { id } });

      res
        .status(200)
        .json(response(200, true, "Company deleted successfully", null));
    } catch (err) {
      next(err);
    }
  }
}

export default CompanyController;
