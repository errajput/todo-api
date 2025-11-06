import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "MY_SECRET";
const SALT_ROUND = 10;

// Function to hash password
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUND);
};

// Function to verify password
export const verifyPassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

// Function to generate JWT
export const generateJwt = (data: object): string => {
  return jwt.sign(data, JWT_SECRET);
};

// Function to verify JWT
export const verifyJwt = (token: string): JwtPayload | string => {
  return jwt.verify(token, JWT_SECRET);
};
