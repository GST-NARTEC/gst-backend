import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

class JWT {
  /**
   * Create a JWT token
   * @param {Object} payload - The payload to encode in the token
   * @param {Object} options - Additional options for the token
   * @returns {string} - The generated JWT token
   */
  static createToken(
    payload,
    options = {
      expiresIn: "1h",
      algorithm: "HS256",
    }
  ) {
    return jwt.sign(payload, process.env.JWT_SECRET, options);
  }
}

export default JWT;
