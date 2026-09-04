import { Router } from "express";
import auth from "../../middlewares/auth";
import { Role } from "../../../../generated/enums";
import { AppointmentController } from "./appointment.controller";

const router = Router();
router.post("/book-appointment", auth(Role.PATIENT),AppointmentController.bookAppointment);

export const AppointmentRouter = router;
