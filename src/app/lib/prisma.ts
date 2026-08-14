import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../../generated/client";
import envConfig from "../config/envConfig";

const connectingString = envConfig.DATABASE_URL;
const adapter = new PrismaPg({ connectionString: connectingString });
const prisma = new PrismaClient({ adapter });
export { prisma };
