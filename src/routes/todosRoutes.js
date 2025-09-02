import { Router } from "express";
import jwt from "jsonwebtoken";
import { ZodError } from "zod";

import TodoModel from "../models/todoModel.js";
import { TodoCreateSchema } from "../validations/todovalidation.js";

const router = Router();

// NOTE: CREATE NEW TODO

router.post("/", async (req, res) => {
  try {
    const validatedData = TodoCreateSchema.parse(req.body);
    const data = jwt.verify(
      req.headers.authorization.split(" ")[1],
      "JWT_SECRET"
    );
    const userId = data.id;
    const createdTodo = await TodoModel.insertOne({
      ...validatedData,
      createdBy: userId,
    });

    res.json({ message: "Success fetched.", data: createdTodo.id });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(403).send({ error: "error.", errors: error.issues });
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      res.status(403).send({ error: "Token expired please login again." });
      return;
    }
    console.log(`Error - ${req.method}:${req.path} - `, error);
    res.status(500).send({ error: error.message });
  }
});

// NOTE: READ THE TODO
router.get("/", async (req, res) => {
  try {
    const data = jwt.verify(
      req.headers.authorization.split(" ")[1],
      "JWT_SECRET"
    );
    const userId = data.id;
    const todos = await TodoModel.find({ createdBy: userId });

    res.json({ message: "Success fetched.", data: todos });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(403).send({ error: "Token expired please login again." });
      return;
    }
    console.log(`Error - ${req.method}:${req.path} - `, error);
    res.status(500).send({ error: error.message });
  }
});
router.get("/:id", async (req, res) => {
  try {
    const todo = await TodoModel.findById(req.params.id);
    if (!todo) {
      res.status(404).send({ message: "Not Found." });
      return;
    }

    res.json({ message: "Success fetched.", data: todo });
  } catch (error) {
    console.log(`Error - ${req.method}:${req.path} - `, error);
    res.status(500).send({ error: error.message });
  }
});
// NOTE: UPDATE THE TODO
router.patch("/:id", async (req, res) => {
  try {
    const validatedData = TodoCreateSchema.parse(req.body);
    await TodoModel.updateOne(
      { _id: req.params.id },
      { $set: { ...validatedData } }
    );

    res.json({ message: "Success Updated." });
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
router.delete("/todos/:id", async (req, res) => {
  try {
    const todos = await TodoModel.find();
    res.send({ message: "Success Fetched.", data: todos });
  } catch (error) {
    console.log(`Error - ${req.method}:${req.path} - `, error);
    res.status(500).send({ error: error.message });
  }
});

export default router;
