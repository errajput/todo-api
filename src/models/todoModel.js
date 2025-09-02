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
    order: {
      type: Number,
      default: 0,
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
