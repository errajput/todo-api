import { Router, Request, Response } from "express";
import { ZodError } from "zod";

import UserModel from "../models/userModel";
import { LoginSchema, RegisterSchema } from "../validations/authvalidation";
import { generateJwt, hashPassword, verifyPassword } from "../shared/utils";

const router = Router();

// ------------------ REGISTER ------------------
router.post("/register", async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = RegisterSchema.parse(req.body);

    const existingUser = await UserModel.findOne({
      email: validatedData.email,
    });
    if (existingUser) {
      res.status(400).json({ message: "Email already used." });
      return;
    }

    const { email, password, name } = validatedData;
    const hashedPassword = await hashPassword(password);

    const newUser = new UserModel({ email, password: hashedPassword, name });
    await newUser.save();

    res.status(201).json({ message: "User Registered" });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: "Validation Error", errors: error.issues });
      return;
    }

    const err = error as Error;
    console.error(`Error - ${req.method}:${req.path} - `, err);
    res.status(500).json({ error: err.message });
  }
});

// ------------------ LOGIN ------------------
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = LoginSchema.parse(req.body);
    const { email, password } = validatedData;

    const user = await UserModel.findOne({ email });
    if (!user) {
      res.status(400).json({ message: "Invalid credentials." });
      return;
    }

    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      res.status(400).json({ message: "Invalid credentials." });
      return;
    }

    const token = generateJwt({ email, id: user._id });
    res.status(200).json({ message: "Login Successful", data: { token } });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: "Validation Error", errors: error.issues });
      return;
    }

    const err = error as Error;
    console.error(`Error - ${req.method}:${req.path} - `, err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
