import {
  contactUsQuerySchema,
  contactUsSchema,
} from "../schemas/contactUs.schema.js";
import MyError from "../utils/error.js";
import prisma from "../utils/prismaClient.js";
import response from "../utils/response.js";

// Controller class
class ContactUsController {
  // Create new contact inquiry
  static async createContactUs(req, res, next) {
    try {
      const { error, value } = contactUsSchema.validate(req.body);
      if (error) throw new MyError(error.details[0].message, 400);

      const contact = await prisma.contactUs.create({ data: value });

      res
        .status(201)
        .json(
          response(201, true, "Inquiry submitted successfully", { contact })
        );
    } catch (error) {
      next(error);
    }
  }

  // Get all inquiries (paginated, with optional partial search)
  static async getContactUsList(req, res, next) {
    try {
      const { error, value } = contactUsQuerySchema.validate(req.query);
      if (error) throw new MyError(error.details[0].message, 400);

      const { page, limit, search } = value;
      const skip = (page - 1) * limit;

      // Build where clause for partial search
      let where = {};
      if (search && search.trim() !== "") {
        where = {
          OR: [
            { name: { contains: search } },
            { email: { contains: search } },
            { mobile: { contains: search } },
            { companyName: { contains: search } },
            { subject: { contains: search } },
            { message: { contains: search } },
          ],
        };
      }

      const [contacts, total] = await Promise.all([
        prisma.contactUs.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.contactUs.count({ where }),
      ]);

      res.status(200).json(
        response(200, true, "Contact inquiries fetched", {
          contacts,
          total,
          page,
          limit,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  // Get single inquiry by id
  static async getContactUsById(req, res, next) {
    try {
      const { id } = req.params;
      const contact = await prisma.contactUs.findUnique({ where: { id } });
      if (!contact) throw new MyError("Inquiry not found", 404);

      res.status(200).json(response(200, true, "Inquiry fetched", { contact }));
    } catch (error) {
      next(error);
    }
  }

  // Delete inquiry
  static async deleteContactUs(req, res, next) {
    try {
      const { id } = req.params;
      const contact = await prisma.contactUs.findUnique({ where: { id } });
      if (!contact) throw new MyError("Inquiry not found", 404);

      await prisma.contactUs.delete({ where: { id } });

      res
        .status(200)
        .json(response(200, true, "Inquiry deleted successfully", null));
    } catch (error) {
      next(error);
    }
  }
}

export default ContactUsController;
