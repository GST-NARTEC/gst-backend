import {
  updateUserDocSchema,
  userDocSchema,
} from "../schemas/userDoc.schema.js";
import MyError from "../utils/error.js";
import { addDomain, deleteFile } from "../utils/file.js";
import prisma from "../utils/prismaClient.js";
import response from "../utils/response.js";

class UserDocController {
  async createUserDoc(req, res, next) {
    try {
      const { error, value } = userDocSchema.validate(req.body);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      let { name, doc, userId } = value;

      if (req.user?.id) {
        userId = req.user.id;
      }

      if (!req.file) {
        throw new MyError("Please upload doc file", 400);
      }

      doc = addDomain(req.file.path);

      const userDoc = await prisma.userDoc.create({
        data: { name, doc, userId },
      });

      res
        .status(201)
        .json(response(201, true, "Document created successfully", userDoc));
    } catch (error) {
      if (req.file) {
        await deleteFile(req.file.path);
      }
      next(error);
    }
  }

  async updateUserDoc(req, res, next) {
    try {
      const { error, value } = updateUserDocSchema.validate(req.body);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const { name, doc } = value;

      const existingDoc = await prisma.userDoc.findUnique({
        where: { id: req.params.id },
      });

      if (!existingDoc) {
        throw new MyError("Document not found", 404);
      }

      if (req.file) {
        await deleteFile(existingDoc.doc);
        doc = addDomain(req.file.path);
      } else {
        doc = existingDoc.doc;
      }

      name = name || existingDoc.name;

      const userDoc = await prisma.userDoc.update({
        where: { id: req.params.id },
        data: { name, doc },
      });

      res
        .status(200)
        .json(response(200, true, "Document updated successfully", userDoc));
    } catch (error) {
      if (req.file) {
        await deleteFile(req.file.path);
      }
      next(error);
    }
  }

  async deleteUserDoc(req, res, next) {
    try {
      const userDoc = await prisma.userDoc.findUnique({
        where: { id: req.params.id },
      });

      if (!userDoc) {
        throw new MyError("Document not found", 404);
      }

      await deleteFile(userDoc.doc);

      const deletedDoc = await prisma.userDoc.delete({
        where: { id: req.params.id },
      });

      res
        .status(200)
        .json(response(200, true, "Document deleted successfully", deletedDoc));
    } catch (error) {
      next(error);
    }
  }

  async getUserDocs(req, res, next) {
    try {
      const userId = req.user?.id || req.params.userId;

      const userDocs = await prisma.userDoc.findMany({
        where: { userId },
      });

      res
        .status(200)
        .json(response(200, true, "Documents fetched successfully", userDocs));
    } catch (error) {
      next(error);
    }
  }
}

export default new UserDocController();
