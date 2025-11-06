import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ZodError } from "zod";

import { verifyToken } from "../middleware/authmiddleware";
import UserModel from "../models/userModel";
import { UpdateUserSchema } from "../validations/authvalidation";

const router = Router();

//  Extend Express Request to include `userId`
interface AuthenticatedRequest extends Request {
  userId?: string;
}

//  GET /user/profile

router.get(
  "/profile",
  verifyToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = await UserModel.findById(req.userId, "-password -__v");

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.json({
        message: "Successfully fetched.",
        data: { user },
      });
    } catch (error: any) {
      if (error instanceof jwt.TokenExpiredError) {
        return res
          .status(403)
          .json({ error: "Token expired, please login again." });
      }

      console.error(`Error - ${req.method}:${req.path} - `, error);
      return res.status(500).json({ error: error.message });
    }
  }
);

//  PATCH /user/profile

router.patch(
  "/profile",
  verifyToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { name } = UpdateUserSchema.parse(req.body);

      const user = await UserModel.findByIdAndUpdate(
        req.userId,
        { $set: { name } },
        { new: true }
      ).select("-password");

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.json({
        message: "Profile updated successfully",
        user,
      });
    } catch (err: any) {
      if (err instanceof ZodError) {
        return res
          .status(400)
          .json({ error: "Validation failed", issues: err.issues });
      }

      console.error(`Error - ${req.method}:${req.path}`, err);
      return res.status(500).json({ error: err.message });
    }
  }
);

export default router;
