import z from "zod";


const ForgotPasswordValidationSchema = z.object({
  email: z.email("Email is required"),
});

const ResetPasswordValidationSchema = z.object({
  email: z.email(),

  newPassword: z.string().min(6, "Password must be at least 6 characters long"),

  otp: z.string().regex(/^\d{6}$/, "OTP must be exactly 6 digits"),
});

export const AuthValidation = {
  ForgotPasswordValidationSchema,
  ResetPasswordValidationSchema,
};
