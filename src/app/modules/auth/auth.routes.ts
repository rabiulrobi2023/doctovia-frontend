import { Router } from "express";
import { AuthController } from "./auth.controller";

const router = Router();
router.get("/sign-up", AuthController.createUser);

export const AuthRouter = router;
