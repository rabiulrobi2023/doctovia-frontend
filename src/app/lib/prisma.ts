import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "../config/envConfig";
import { PrismaClient } from "../../../src/generated/client";

const connectingString = config.DATABASE_URL;
const adapter = new PrismaPg({ connectionString: connectingString });
const prisma = new PrismaClient({ adapter });
export { prisma };
