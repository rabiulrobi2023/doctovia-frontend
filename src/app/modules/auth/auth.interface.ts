import type { JwtPayload } from "jsonwebtoken";
import type { Role } from "../../../../generated/enums";

export interface IRegisterPatientPayload {
  name: string;
  email: string;
  password: string;
}

export interface IForgotPasswordPayload {
  email: string;
}

export interface IResetPasswordPayload {
  email: string;
  newPassword: string;
  otp: string;
}

export interface IVerifyPatientEmailPayload {
  email: string;
  otp: string;
}

export interface IJwtPayload extends JwtPayload {
  name: string;
  email: string;
  role: Role;
}
