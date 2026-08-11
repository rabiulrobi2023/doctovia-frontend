import "dotenv/config";
import { defineConfig } from "prisma/config";
import envConfig from "./src/app/config/envConfig";

export default defineConfig({
  schema: "./prisma/schema",
  migrations: {
    path: "./prisma/migrations",
  },
  datasource: {
    url: envConfig.DATABASE_URL as string,
  },
});
