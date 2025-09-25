import { Router } from "express";
import jwt from "jsonwebtoken";

import { verifyToken } from "../middleware/verifyToken.js";
import UserModel from "../models/userModel.js";
import { ZodError } from "zod";
import { UpdateUserSchema } from "../validations/authvalidation.js";

const router = Router();

router.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId, "-password -__v");

    return res.send({ message: "Successfully fetched.", data: { user } });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(403).send({ error: "Token expired please login again." });
      return;
    }
    console.log(`Error - ${req.method}:${req.path} - `, error);
    res.status(500).send({ error: error.message });
  }
});
router.patch("/profile", verifyToken, async (req, res) => {
  try {
    const { name } = UpdateUserSchema.parse(req.body);

    const user = await UserModel.findByIdAndUpdate(
      req.userId, // comes from verifyToken
      { $set: { name } },
      { new: true }
    ).select("-password"); // don’t send password in response

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Profile updated successfully", user });
  } catch (err) {
    if (err instanceof ZodError) {
      return res
        .status(400)
        .json({ error: "Validation failed", issues: err.issues });
    }
    console.error(`Error - ${req.method}:${req.path}`, err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
