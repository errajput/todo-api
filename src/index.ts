import express, { Application, Request, Response } from "express";
import mongoose from "mongoose";
import cors from "cors";

// Route imports (make sure these files are also converted to TypeScript)
import UserRoutes from "./routes/userRoutes";
import AuthRoutes from "./routes/authRoutes";
import TodosRoutes from "./routes/todosRoutes";

const MONGODB_URI = process.env.MONGODB_URI as string;
const DB_NAME = process.env.DB_NAME || "todo-api";
const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;

const app: Application = express();

// MongoDB Connection
mongoose.connection.on("connected", () => console.log(" MongoDB Connected"));
mongoose.connection.on("error", (err: Error) =>
  console.error(" MongoDB Error:", err)
);

mongoose
  .connect(MONGODB_URI, { dbName: DB_NAME })
  .then(() => console.log(" Database connection successful"))
  .catch((err) => console.error(" Database connection failed:", err));

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.get("/", (req: Request, res: Response) => {
  res.send("Ok");
});

app.use("/auth", AuthRoutes);
app.use("/user", UserRoutes);
app.use("/todos", TodosRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(` Server is running on port ${PORT}`);
});
