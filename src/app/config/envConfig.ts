import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join((process.cwd(), ".env")) });

console.log("path:", process.cwd(), ".env");

export const config = {
  PORT: Number(process.env.PORT || 5000),
  SERVER_NAME: process.env.SERVER_NAME,
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  FRONTEND_URL: process.env.FRONTEND_URL,
};
