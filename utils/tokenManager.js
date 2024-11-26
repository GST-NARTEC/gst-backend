import jwt from "jsonwebtoken";
import config from "../config/config.js";

class TokenManager {
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

export default TokenManager;
