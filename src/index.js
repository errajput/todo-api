import express from "express";
import mongoose from "mongoose";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGODB_URI);

const todoNewSchema = new mongoose.Schema({
  title: { type: String, required: true },
  isDone: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
});

const Todo = new mongoose.model("TodoApp", todoNewSchema);

// NOTE: CREATE NEW TODO

app.post("/todos", async (req, res) => {
  try {
    const count = await Todo.countDocuments();

    const newTodo = new Todo({
      title: req.body.title,
      order: count,
    });
    await newTodo.save();
    res.json(newTodo);
  } catch (error) {
    console.log("getting error", error);
    res.status(500).send({ message: "Error saving todo", error });
  }
});

// NOTE: READ THE TODO
app.get("/todos", async (req, res) => {
  try {
    const readTodo = await Todo.find();
    res.json(readTodo);
  } catch (error) {
    res.status(500).send({ message: "Error reading Todo", error });
  }
});

// NOTE: UPDATE THE TODO
app.patch("/todos/:id", async (req, res) => {
  try {
    const updatedTodo = await Todo.findByIdAndUpdate(
      req.params.id,
      {
        ...(req.body.title !== undefined && { title: req.body.title }),
        ...(req.body.isDone !== undefined && { isDone: req.body.isDone }),
        updatedAt: new Date(),
      },
      { new: true }
    );
    res.json({ updatedTodo });
  } catch (error) {
    res.status(500).send({ message: "Error updating Todo", error });
  }
});

// NOTE: DELETE THE TODO
app.delete("/todos/:id", async (req, res) => {
  try {
    const deleteTodo = await Todo.findByIdAndDelete(req.params.id);
    res.json(deleteTodo);
  } catch (error) {
    res.status(500).send({ message: "Error deleting Todo", error });
  }
});
app.listen(process.env.PORT, () => {
  console.log(`App is listen on port ${process.env.PORT}`);
});
