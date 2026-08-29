import z, { email, number, string } from "zod";

const registerUserSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name maximum 50 character log")
    .trim(),
  email: z.email().min(1, "Email is required"),
  password: z
    .string()
    .min(6, "Password minimum 6 character log")
    .max(20, "Password maximum 20 character log"),
});

const patientEmailVerificationSchema = z.object({
  email: z.email(),
  otp: z.string().regex(/^\d{6}$/, "OTP must be exactly 6 digits")
});

const ForgotPasswordValidationSchema = z.object({
  email: z.email("Email is required"),
});

const ResetPasswordValidationSchema = z.object({
  email: z.email(),

  newPassword: z.string().min(6, "Password must be at least 6 characters long"),

  otp: z.string().regex(/^\d{6}$/, "OTP must be exactly 6 digits"),
});

export const AuthValidation = {
  registerUserSchema,
  patientEmailVerificationSchema,
  ForgotPasswordValidationSchema,
  ResetPasswordValidationSchema,
};
