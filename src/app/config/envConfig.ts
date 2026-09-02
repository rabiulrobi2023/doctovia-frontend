/** biome-ignore-all lint/style/noNonNullAssertion: <explanation> */
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join((process.cwd(), ".env")) });


const envConfig = {
  PORT: Number(process.env.PORT || 5000),
  SERVER_NAME: process.env.SERVER_NAME,
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  FRONTEND_URL: process.env.FRONTEND_URL,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  JWT_ACCESS_TOKEN_SECRET: process.env.JWT_ACCESS_TOKEN_SECRET as string,
  JWT_ACCESS_TOKEN_EXPIRE_IN: process.env.JWT_ACCESS_TOKEN_EXPIRE_IN as string,
  JWT_REFRESH_TOKEN_SECRET: process.env.JWT_REFRESH_TOKEN_SECRET as string,
  JWT_REFRESH_TOKEN_EXPIRE_IN: process.env
    .JWT_REFRESH_TOKEN_EXPIRE_IN as string,
  BCRYPT_SALT_ROUND: process.env.BCRYPT_SALT_ROUND,
  SEED_SUPER_ADMIN_NAME: process.env.SEED_SUPER_ADMIN_NAME,
  SEED_SUPER_ADMIN_EMAIL: process.env.SEED_SUPER_ADMIN_EMAIL,
  SEED_SUPER_ADMIN_PASSWORD: process.env.SEED_SUPER_ADMIN_PASSWORD,
  REDIS_USER_NAME: process.env.REDIS_USER_NAME!,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD!,
  REDIS_PORT: process.env.REDIS_PORT!,
  REDIS_HOST: process.env.REDIS_HOST!,
  RESET_PASS_OTP_EXPIRATION_MINUTE:
    process.env.RESET_PASS_OTP_EXPIRATION_MINUTE,
  REGISTER_AC_EXPIRATION_MINUTE: process.env.REGISTER_AC_EXPIRATION_MINUTE,
  SMTP_USERNAME: process.env.SMTP_USERNAME,
  SMTP_PASS: process.env.SMTP_PASS,
  SMTP_SENDER: process.env.SMTP_SENDER,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET
};
export default envConfig;
