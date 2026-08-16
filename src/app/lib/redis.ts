import { createClient } from "redis";
import envConfig from "../config/envConfig";

export const redisClient = createClient({
  username: envConfig.REDIS_USER_NAME,
  password: envConfig.REDIS_PASSWORD,
  socket: {
    host: envConfig.REDIS_HOST,
    port: Number(envConfig.REDIS_PORT),
  },
});
