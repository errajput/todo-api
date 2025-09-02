import { Router } from "express";
import jwt from "jsonwebtoken";

import { verifyToken } from "../middleware/verifyToken.js";
import UserModel from "../models/userModel.js";

const router = Router();

router.get("/", verifyToken, async (req, res) => {
  // const token = req.headers.authorization;

  // if (!token) {
  //   res.send({ message: "Token is required." });
  //   return;
  // }

  try {
    // const payload = verifyJwt(token);

    // if (!payload) {
    //   res.send({ message: "Invalid Token" });
    //   return;
    // }
    const user = await UserModel.findById(req.userId, "-password -__v");

    return res.send({ message: "Successfully fetched.", data: { user } });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(403).send({ error: "Token expired please login again." });
      return;
    }
    console.log(`Error - ${req.method}:${req.path} - `, error);
    res.status(500).send({ error: error.message });
  }
});

export default router;
