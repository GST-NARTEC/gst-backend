import License from "../models/license.js";
import response from "../utils/response.js";

class LicenseController {
  static async verifyLicense(req, res, next) {
    try {
      const { licenseKey } = req.body;

      if (!licenseKey) {
        throw new Error("License key is required");
      }

      const license = await License.verifyLicense(licenseKey);

      res.status(200).json(
        response(200, true, "License verified successfully", {
          license: license,
        })
      );
    } catch (error) {
      next(error);
    }
  }
}

export default LicenseController;
