import { helpTicketAdminQueue, helpTicketUserQueue } from "../config/queue.js";
import {
  helpTicketSchema,
  helpTicketUpdateSchema,
  querySchema,
} from "../schemas/helpTicket.schema.js";
import MyError from "../utils/error.js";
import { addDomain, deleteFile } from "../utils/file.js";
import prisma from "../utils/prismaClient.js";
import response from "../utils/response.js";

class HelpTicketController {
  static async createTicket(req, res, next) {
    let doc;
    try {
      const { error, value } = helpTicketSchema.validate(req.body);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      if (req.file) {
        doc = addDomain(req.file.path);
      }

      const ticket = await prisma.helpTicket.create({
        data: {
          ...value,
          userId: req.user.id,
          doc,
        },
        include: {
          user: true,
        },
      });

      // Add job to the hel] desk admin queue
      await helpTicketAdminQueue.add(
        "admin-help-ticket-notification",
        {
          ticket,
        },
        {
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 5000,
          },
        }
      );

      res.status(201).json(
        response(201, true, "Help ticket created successfully", {
          ticket,
        })
      );
    } catch (error) {
      if (doc) {
        await deleteFile(doc);
      }
      next(error);
    }
  }

  static async getTickets(req, res, next) {
    try {
      const { error, value } = querySchema.validate(req.query);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const { page, limit, search, status, priority, category } = value;
      const skip = (page - 1) * limit;

      // Build where clause for filtering
      const where = {
        userId: req.user.id,
        ...(status && { status }),
        ...(priority && { priority }),
        ...(category && { category }),
        ...(search
          ? {
              OR: [
                { subject: { contains: search } },
                { message: { contains: search } },
              ],
            }
          : {}),
      };

      const [tickets, total] = await Promise.all([
        prisma.helpTicket.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            user: true,
          },
        }),
        prisma.helpTicket.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      res.status(200).json(
        response(200, true, "Help tickets retrieved successfully", {
          tickets,
          pagination: {
            total,
            page,
            totalPages,
            limit,
          },
        })
      );
    } catch (error) {
      next(error);
    }
  }

  static async getTicket(req, res, next) {
    try {
      const { id } = req.params;

      const ticket = await prisma.helpTicket.findUnique({
        where: {
          id,
          userId: req.user.id,
        },
        include: {
          user: true,
        },
      });

      if (!ticket) {
        throw new MyError("Help ticket not found", 404);
      }

      res.status(200).json(
        response(200, true, "Help ticket retrieved successfully", {
          ticket,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  static async updateTicket(req, res, next) {
    try {
      const { id } = req.params;
      const { error, value } = helpTicketUpdateSchema.validate(req.body);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      // Check if user is admin
      if (!req.superadmin) {
        throw new MyError("Admin access required", 403);
      }

      const ticket = await prisma.helpTicket.findUnique({
        where: { id },
      });

      if (!ticket) {
        throw new MyError("Help ticket not found", 404);
      }

      const updatedTicket = await prisma.helpTicket.update({
        where: { id },
        data: value,
        include: {
          user: true,
        },
      });

      // Add job to the help desk user queue
      await helpTicketUserQueue.add(
        "user-help-ticket-notification",
        {
          ticket: updatedTicket,
        },
        {
          attempts: 3,
        }
      );

      res.status(200).json(
        response(200, true, "Help ticket updated successfully", {
          ticket: updatedTicket,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  static async deleteTicket(req, res, next) {
    try {
      const { id } = req.params;

      // Check if user is admin
      if (!req.superadmin) {
        throw new MyError("Admin access required", 403);
      }

      const ticket = await prisma.helpTicket.findUnique({
        where: { id },
      });

      if (!ticket) {
        throw new MyError("Help ticket not found", 404);
      }

      if (ticket.doc) {
        await deleteFile(ticket.doc);
      }

      await prisma.helpTicket.delete({
        where: { id },
      });

      res
        .status(200)
        .json(response(200, true, "Help ticket deleted successfully", null));
    } catch (error) {
      next(error);
    }
  }

  static async getAdminTickets(req, res, next) {
    try {
      // Check if the request is from a superadmin
      if (!req.superadmin) {
        throw new MyError("Admin access required", 403);
      }

      const { error, value } = querySchema.validate(req.query);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const { page, limit, search, status, priority, category } = value;
      const skip = (page - 1) * limit;

      // Build where clause for filtering
      const where = {
        ...(status && { status }),
        ...(priority && { priority }),
        ...(category && { category }),
        ...(search
          ? {
              OR: [
                { subject: { contains: search } },
                { message: { contains: search } },
              ],
            }
          : {}),
      };

      const [tickets, total] = await Promise.all([
        prisma.helpTicket.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            user: true,
          },
        }),
        prisma.helpTicket.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      res.status(200).json(
        response(200, true, "Help tickets retrieved successfully", {
          tickets,
          pagination: {
            total,
            page,
            totalPages,
            limit,
          },
        })
      );
    } catch (error) {
      next(error);
    }
  }
}

export default HelpTicketController;
