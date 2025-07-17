import { caseStudyTemplate1Schema } from "../schemas/caseStudyTemplate1.schema.js";
import MyError from "../utils/error.js";
import { addDomain, deleteFile } from "../utils/file.js";
import prisma from "../utils/prismaClient.js";
import response from "../utils/response.js";

class CaseStudyTemplate1Controller {
  static async createCaseStudyTemplate1(req, res, next) {
    let imagePaths = [];
    try {
      const { error, value } = caseStudyTemplate1Schema.validate(req.body);
      if (error) throw new MyError(error.details[0].message, 400);

      const page = await prisma.page.findUnique({
        where: { id: value.pageId },
      });
      if (!page) throw new MyError("Referenced page not found", 404);

      if (req.files) {
        for (let i = 1; i <= 3; i++) {
          if (req.files[`image${i}`]) {
            const imagePath = addDomain(req.files[`image${i}`][0].path);
            value[`image${i}`] = imagePath;
            imagePaths.push(imagePath);
          }
        }
      }

      const caseStudyTemplate1 = await prisma.caseStudyTemplate1.create({
        data: value,
      });
      res
        .status(201)
        .json(
          response(201, true, "CaseStudyTemplate1 created successfully", {
            caseStudyTemplate1,
          })
        );
    } catch (error) {
      for (const path of imagePaths) await deleteFile(path);
      next(error);
    }
  }

  static async getCaseStudyTemplate1ByPageId(req, res, next) {
    try {
      const { pageId } = req.query;
      const caseStudyTemplate1 = await prisma.caseStudyTemplate1.findFirst({
        where: { pageId },
        include: { page: true },
      });
      if (!caseStudyTemplate1)
        throw new MyError("CaseStudyTemplate1 not found", 404);
      res
        .status(200)
        .json(
          response(200, true, "CaseStudyTemplate1 retrieved successfully", {
            caseStudyTemplate1,
          })
        );
    } catch (error) {
      next(error);
    }
  }

  static async getCaseStudyTemplate1List(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const skip = (page - 1) * limit;
      const [templates, total] = await Promise.all([
        prisma.caseStudyTemplate1.findMany({
          take: Number(limit),
          skip: Number(skip),
          orderBy: { createdAt: "desc" },
        }),
        prisma.caseStudyTemplate1.count(),
      ]);
      res.status(200).json(
        response(200, true, "Templates retrieved successfully", {
          templates,
          pagination: {
            total,
            page: Number(page),
            totalPages: Math.ceil(total / limit),
            limit: Number(limit),
          },
        })
      );
    } catch (error) {
      next(error);
    }
  }

  static async updateCaseStudyTemplate1(req, res, next) {
    let imagePaths = [];
    try {
      const { id } = req.params;
      const { error, value } = caseStudyTemplate1Schema.validate(req.body);
      if (error) throw new MyError(error.details[0].message, 400);

      const existing = await prisma.caseStudyTemplate1.findUnique({
        where: { id },
      });
      if (!existing) throw new MyError("CaseStudyTemplate1 not found", 404);

      if (req.files) {
        for (let i = 1; i <= 3; i++) {
          if (req.files[`image${i}`]) {
            const imagePath = addDomain(req.files[`image${i}`][0].path);
            if (existing[`image${i}`]) await deleteFile(existing[`image${i}`]);
            value[`image${i}`] = imagePath;
            imagePaths.push(imagePath);
          }
        }
      }

      const caseStudyTemplate1 = await prisma.caseStudyTemplate1.update({
        where: { id },
        data: value,
      });
      res
        .status(200)
        .json(
          response(200, true, "CaseStudyTemplate1 updated successfully", {
            caseStudyTemplate1,
          })
        );
    } catch (error) {
      for (const path of imagePaths) await deleteFile(path);
      next(error);
    }
  }

  static async deleteCaseStudyTemplate1(req, res, next) {
    try {
      const { id } = req.params;
      const existing = await prisma.caseStudyTemplate1.findUnique({
        where: { id },
      });
      if (!existing) throw new MyError("CaseStudyTemplate1 not found", 404);
      for (let i = 1; i <= 3; i++) {
        if (existing[`image${i}`]) await deleteFile(existing[`image${i}`]);
      }
      await prisma.caseStudyTemplate1.delete({ where: { id } });
      res
        .status(200)
        .json(response(200, true, "CaseStudyTemplate1 deleted successfully"));
    } catch (error) {
      next(error);
    }
  }
}

export default CaseStudyTemplate1Controller;
