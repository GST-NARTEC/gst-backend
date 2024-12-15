import prisma from "../utils/prismaClient.js";
import response from "../utils/response.js";

class DocTypeController {
  async getDocTypes(req, res, next) {
    try {
      const docTypes = await prisma.docType.findMany();

      res
        .status(200)
        .json(
          response(200, true, "Documents types fetched successfully", docTypes)
        );
    } catch (error) {
      next(error);
    }
  }
}

export default new DocTypeController();
