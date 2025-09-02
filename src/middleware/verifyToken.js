import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "MY_SECRET";

export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Token format => "Bearer <token>"
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Invalid token format" });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Invalid or expired token" });
      }

      req.userId = decoded.id; // Store userId in request
      next();
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({ message: "Server error", error: err.message });
  }
};

import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";

const SALT_ROUND = 10;

export const hashPassword = (password) => {
  return bcrypt.hash(password, SALT_ROUND);
};

export const verifyPassword = (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

export const generateJwt = (data) => {
  return jwt.sign(data, JWT_SECRET);
};

export const verifyJwt = (token) => {
  return jwt.verify(token, JWT_SECRET);
};
