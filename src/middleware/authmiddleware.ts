import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken"; // ✅ Default import
import { verifyJwt } from "../shared/utils";

// Extend Express Request to include userId added by JWT verification
export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export const verifyToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      res.status(401).json({ message: "No token provided" });
      return;
    }

    // Expected format: "Bearer <token>"
    const token = authHeader.split(" ")[1];
    if (!token) {
      res.status(401).json({ message: "Invalid token format" });
      return;
    }

    const decoded = verifyJwt(token) as { id: string };

    if (!decoded?.id) {
      res.status(403).json({ message: "Invalid token payload" });
      return;
    }

    req.userId = decoded.id;
    next();
  } catch (err: unknown) {
    // ✅ Access the error classes via jwt
    if (
      err instanceof jwt.TokenExpiredError ||
      err instanceof jwt.JsonWebTokenError
    ) {
      res.status(403).json({ message: "Invalid or expired token" });
      return;
    }

    const error = err as Error;
    console.error("Auth middleware error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
