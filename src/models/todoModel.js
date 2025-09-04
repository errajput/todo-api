import { Schema, model } from "mongoose";

const TodoSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    isDone: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: Schema.ObjectId,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
const TodoModel = model("todos", TodoSchema);
export default TodoModel;
