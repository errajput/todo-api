import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import UserRoutes from "./routes/userRoutes.js";
import AuthRoutes from "./routes/authRoutes.js";
import TodosRoutes from "./routes/todosRoutes.js";

const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 5000;
const app = express();

mongoose.connect(MONGODB_URI, { dbName: "product-curd" });
mongoose.connection.on("connected", () => console.log("MongoDB Connected"));

app.use(express.json());
app.use(cors());
app.get("/", (req, res) => res.send("Ok"));

app.use("/auth", AuthRoutes);
app.use("/user", UserRoutes);
app.use("/todos", TodosRoutes);

app.listen(PORT, () => console.log(`App is listening on port ${PORT}`));
