import { Router } from "express";
import { UserController } from "./user.controller";
import auth from "../../middlewares/auth";
import { Role } from "../../../../generated/enums";
import upload from "../../lib/multer";

const router = Router();

router.patch(
  "/profile-photo",
  auth(Role.ADMIN, Role.DOCTOR, Role.PATIENT, Role.SUPER_ADMIN),
  upload.single("profilePhoto"),
  UserController.updateUserProfilePhoto,
);

export const UserRouter = router;
