import { Router, Request, Response } from "express";

import { jwt, ZodError } from "zod";

import TodoModel from "../models/todoModel";
import {
  ReorderSchema,
  TodoCreateSchema,
  UpdatedSchema,
} from "../validations/todoValidation";
import { verifyToken } from "../middleware/authmiddleware";

// ✅ Extend Express Request type to include userId added by verifyToken
interface AuthenticatedRequest extends Request {
  userId?: string;
}

const router = Router();

// -------------------- CREATE TODO --------------------
router.post(
  "/",
  verifyToken,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const validatedData = TodoCreateSchema.parse(req.body);
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({ message: "Unauthorized: Missing user ID" });
        return;
      }

      const lastTodo = await TodoModel.findOne({ createdBy: userId }).sort({
        order: -1,
      });
      const nextOrder = lastTodo ? lastTodo.order + 1 : 0;

      const createdTodo = await TodoModel.create({
        ...validatedData,
        createdBy: userId,
        order: nextOrder,
      });

      res.status(201).json({
        message: "Todo added successfully.",
        data: createdTodo.id,
      });
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        res
          .status(400)
          .json({ error: "Validation Error", errors: error.issues });
        return;
      }

      const err = error as Error;
      console.error(`Error - ${req.method}:${req.path}:`, err);
      res.status(500).json({ error: err.message });
    }
  }
);

// -------------------- READ ALL TODOS --------------------
router.get(
  "/",
  verifyToken,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ message: "Unauthorized: Missing user ID" });
        return;
      }

      const todos = await TodoModel.find({ createdBy: userId }).sort({
        order: 1,
      });

      res.json({ message: "Todos fetched successfully.", data: todos });
    } catch (error: unknown) {
      if (error instanceof jwt) {
        res.status(403).json({ error: "Token expired. Please log in again." });
        return;
      }

      const err = error as Error;
      console.error(`Error - ${req.method}:${req.path}:`, err);
      res.status(500).json({ error: err.message });
    }
  }
);

// -------------------- READ SINGLE TODO --------------------
router.get(
  "/:id",
  verifyToken,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const todo = await TodoModel.findOne({
        _id: req.params.id,
        createdBy: req.userId,
      });

      if (!todo) {
        res.status(404).json({ message: "Todo not found." });
        return;
      }

      res.json({ message: "Todo fetched successfully.", data: todo });
    } catch (error: unknown) {
      const err = error as Error;
      console.error(`Error - ${req.method}:${req.path}:`, err);
      res.status(500).json({ error: err.message });
    }
  }
);

// -------------------- UPDATE TODO --------------------
router.patch(
  "/:id",
  verifyToken,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const validatedData = UpdatedSchema.parse(req.body);
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const updatedTodo = await TodoModel.updateOne(
        { _id: req.params.id, createdBy: userId },
        { $set: { ...validatedData } }
      );

      res.json({ message: "Todo updated successfully.", data: updatedTodo });
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        res
          .status(400)
          .json({ error: "Validation Error", errors: error.issues });
        return;
      }

      const err = error as Error;
      console.error(`Error - ${req.method}:${req.path}:`, err);
      res.status(500).json({ error: err.message });
    }
  }
);

// -------------------- REORDER TODOS --------------------
router.put(
  "/reorder",
  verifyToken,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const updatedTodoOrder = ReorderSchema.parse(req.body);

      for (const todo of updatedTodoOrder) {
        await TodoModel.updateOne({ _id: todo._id }, { order: todo.order });
      }

      res.json({ message: "Order updated successfully." });
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        res
          .status(400)
          .json({ error: "Validation Error", errors: error.issues });
        return;
      }

      const err = error as Error;
      console.error(`Error - ${req.method}:${req.path}:`, err);
      res.status(500).json({ error: err.message });
    }
  }
);

// -------------------- DELETE TODO --------------------
router.delete(
  "/:id",
  verifyToken,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const deleted = await TodoModel.deleteOne({
        _id: req.params.id,
        createdBy: userId,
      });

      res.json({ message: "Todo deleted successfully.", data: deleted });
    } catch (error: unknown) {
      const err = error as Error;
      console.error(`Error - ${req.method}:${req.path}:`, err);
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;
