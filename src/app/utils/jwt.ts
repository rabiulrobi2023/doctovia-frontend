import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";
import envConfig from "../config/envConfig";
import type { IJwtPayload } from "../modules/auth/auth.interface";

export const generateAccessToken = (payload: IJwtPayload) => {
  const token = jwt.sign(payload, envConfig.JWT_ACCESS_TOKEN_SECRET, {
    expiresIn: envConfig.JWT_ACCESS_TOKEN_EXPIRE_IN,
  } as SignOptions);

  return token;
};
export const generateRefreshToken = (payload: IJwtPayload) => {
  const token = jwt.sign(payload, envConfig.JWT_REFRESH_TOKEN_SECRET, {
    expiresIn: envConfig.JWT_REFRESH_TOKEN_EXPIRE_IN,
  } as SignOptions);

  return token;
};

export const verifyJwtToken = (token: string, secret: string): JwtPayload =>
  jwt.verify(token, secret) as JwtPayload;
