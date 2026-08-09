import "dotenv/config";
import { defineConfig } from "prisma/config";
import { config } from "./src/app/config/envConfig";

export default defineConfig({
  schema: "./prisma/schema",
  migrations: {
    path: "./prisma/migrations",
  },
  datasource: {
    url: config.DATABASE_URL as string,
  },
});
