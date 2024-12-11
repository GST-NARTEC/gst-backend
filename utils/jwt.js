import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import config from "../config/config.js";

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

  static verifyToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
  }

  static generateAccessToken(payload) {
    return jwt.sign(payload, config.JWT_ACCESS_SECRET, {
      expiresIn: config.JWT_ACCESS_EXPIRY,
    });
  }

  static generateRefreshToken(payload) {
    return jwt.sign(payload, config.JWT_REFRESH_SECRET, {
      expiresIn: config.JWT_REFRESH_EXPIRY,
    });
  }

  static verifyAccessToken(token) {
    return jwt.verify(token, config.JWT_ACCESS_SECRET);
  }

  static verifyRefreshToken(token) {
    return jwt.verify(token, config.JWT_REFRESH_SECRET);
  }
}

export default JWT;
