import { Router } from "express";
import validationRequest from "../../middlewares/validationRequest";
import { AuthController } from "./auth.controller";
import { AuthValidation } from "./auth.validation";

const router = Router();

router.post(
  "/register",
  validationRequest(AuthValidation.registerUserSchema),
  AuthController.registerPatient,
);

router.post(
  "/verify-patient-email",
  validationRequest(AuthValidation.patientEmailVerificationSchema),
  AuthController.verifyEmailAndCreatePatient,
);

router.post(
  "/forgot-password",
  validationRequest(AuthValidation.ForgotPasswordValidationSchema),
  AuthController.forgotPassword,
);

router.post(
  "/reset-password",
  validationRequest(AuthValidation.ResetPasswordValidationSchema),
  AuthController.resetPassword,
);

export const AuthRouter = router;
