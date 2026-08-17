import { Router } from "express";
import validationRequest from "../../middlewares/validationRequest";
import { AuthController } from "./auth.controller";
import { AuthValidation } from "./auth.validation";

const router = Router();
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
