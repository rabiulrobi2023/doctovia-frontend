import bcrypt from "bcryptjs";
import envConfig from "../config/envConfig";

export const hashPassword = async (password: string) => {
  return bcrypt.hash(password, Number(envConfig.BCRYPT_SALT_ROUND));
};
