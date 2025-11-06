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
    order: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);
const TodoModel = model("todos", TodoSchema);
export default TodoModel;
