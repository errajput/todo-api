import { Router } from "express";
import jwt from "jsonwebtoken";
import { ZodError } from "zod";

import TodoModel from "../models/todoModel.js";
import {
  TodoCreateSchema,
  UpdatedSchema,
} from "../validations/todoValidation.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { UpdateUserSchema } from "../validations/authvalidation.js";

const router = Router();

// NOTE: CREATE NEW TODO
router.post("/", verifyToken, async (req, res) => {
  try {
    const validatedData = TodoCreateSchema.parse(req.body);
    const userId = req.userId;
    const lastTodo = await TodoModel.findOne({ createdBy: userId }).sort({
      order: -1,
    });
    const nextOrder = lastTodo ? lastTodo.order + 1 : 0;

    const createdTodo = await TodoModel.create({
      ...validatedData,
      createdBy: userId,
      order: nextOrder,
    });

    res.json({ message: "Add a Todo Successfully.", data: createdTodo.id });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).send({ error: "error.", errors: error.issues });
      return;
    }
    console.log(`Error - ${req.method}:${req.path} - `, error);
    res.status(500).send({ error: error.message });
  }
});

// NOTE: READ THE TODO
router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const todos = await TodoModel.find({ createdBy: userId }).sort({
      order: 1,
    });

    res.json({ message: "todos Successfully fetched.", data: todos });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(403).send({ error: "Token expired please login again." });
      return;
    }
    console.log(`Error - ${req.method}:${req.path} - `, error);
    res.status(500).send({ error: error.message });
  }
});

router.get("/:id", verifyToken, async (req, res) => {
  try {
    const todo = await TodoModel.findOne({
      _id: req.params.id,
      createdBy: req.userId,
    });
    if (!todo) {
      res.status(404).send({ message: "Not Found." });
      return;
    }

    res.json({ message: "A Todo Successfully fetched.", data: todo });
  } catch (error) {
    console.log(`Error - ${req.method}:${req.path} - `, error);
    res.status(500).send({ error: error.message });
  }
});

// NOTE: UPDATE THE TODO
router.patch("/:id", verifyToken, async (req, res) => {
  try {
    const validatedData = UpdatedSchema.parse(req.body);
    const userId = req.userId;
    const updatedTodo = await TodoModel.updateOne(
      { _id: req.params.id, createdBy: userId },
      { $set: { ...validatedData } }
    );

    res.json({ message: "Todo Updated successfully.", data: updatedTodo });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).send({ error: "error.", errors: error.issues });
      return;
    }
    console.log(`Error - ${req.method}:${req.path} - `, error);
    res.status(500).send({ error: error.message });
  }
});

// NOTE: DELETE THE TODO
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const todos = await TodoModel.deleteOne({
      _id: req.params.id,
      createdBy: userId,
    });

    res.send({ message: "Todo delete Successfully.", data: todos });
  } catch (error) {
    console.log(`Error - ${req.method}:${req.path} - `, error);
    res.status(500).send({ error: error.message });
  }
});

export default router;
