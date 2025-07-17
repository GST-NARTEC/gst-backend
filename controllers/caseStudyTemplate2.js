import { caseStudyTemplate2Schema } from "../schemas/caseStudyTemplate2.schema.js";
import MyError from "../utils/error.js";
import { addDomain, deleteFile } from "../utils/file.js";
import prisma from "../utils/prismaClient.js";
import response from "../utils/response.js";

class CaseStudyTemplate2Controller {
  static async createCaseStudyTemplate2(req, res, next) {
    let imagePaths = [];
    try {
      const { error, value } = caseStudyTemplate2Schema.validate(req.body);
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

      const caseStudyTemplate2 = await prisma.caseStudyTemplate2.create({
        data: value,
      });
      res
        .status(201)
        .json(
          response(201, true, "CaseStudyTemplate2 created successfully", {
            caseStudyTemplate2,
          })
        );
    } catch (error) {
      for (const path of imagePaths) await deleteFile(path);
      next(error);
    }
  }

  static async getCaseStudyTemplate2ByPageId(req, res, next) {
    try {
      const { pageId } = req.query;
      const caseStudyTemplate2 = await prisma.caseStudyTemplate2.findFirst({
        where: { pageId },
        include: { page: true },
      });
      if (!caseStudyTemplate2)
        throw new MyError("CaseStudyTemplate2 not found", 404);
      res
        .status(200)
        .json(
          response(200, true, "CaseStudyTemplate2 retrieved successfully", {
            caseStudyTemplate2,
          })
        );
    } catch (error) {
      next(error);
    }
  }

  static async getCaseStudyTemplate2List(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const skip = (page - 1) * limit;
      const [templates, total] = await Promise.all([
        prisma.caseStudyTemplate2.findMany({
          take: Number(limit),
          skip: Number(skip),
          orderBy: { createdAt: "desc" },
        }),
        prisma.caseStudyTemplate2.count(),
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

  static async updateCaseStudyTemplate2(req, res, next) {
    let imagePaths = [];
    try {
      const { id } = req.params;
      const { error, value } = caseStudyTemplate2Schema.validate(req.body);
      if (error) throw new MyError(error.details[0].message, 400);

      const existing = await prisma.caseStudyTemplate2.findUnique({
        where: { id },
      });
      if (!existing) throw new MyError("CaseStudyTemplate2 not found", 404);

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

      const caseStudyTemplate2 = await prisma.caseStudyTemplate2.update({
        where: { id },
        data: value,
      });
      res
        .status(200)
        .json(
          response(200, true, "CaseStudyTemplate2 updated successfully", {
            caseStudyTemplate2,
          })
        );
    } catch (error) {
      for (const path of imagePaths) await deleteFile(path);
      next(error);
    }
  }

  static async deleteCaseStudyTemplate2(req, res, next) {
    try {
      const { id } = req.params;
      const existing = await prisma.caseStudyTemplate2.findUnique({
        where: { id },
      });
      if (!existing) throw new MyError("CaseStudyTemplate2 not found", 404);
      for (let i = 1; i <= 3; i++) {
        if (existing[`image${i}`]) await deleteFile(existing[`image${i}`]);
      }
      await prisma.caseStudyTemplate2.delete({ where: { id } });
      res
        .status(200)
        .json(response(200, true, "CaseStudyTemplate2 deleted successfully"));
    } catch (error) {
      next(error);
    }
  }
}

export default CaseStudyTemplate2Controller;
