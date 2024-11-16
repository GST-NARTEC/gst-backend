import jwt from "jsonwebtoken";


export const generateToken = (payload, expiresIn = "5m") => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};
