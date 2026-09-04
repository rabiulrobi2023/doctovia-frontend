import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AppointmentService } from "./appointment.service";

const bookAppointment = catchAsync(async (req, res, next) => {
  const result = await AppointmentService.bookAppointment();
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    message: "Appointment booked successfully",
    data: result,
  });
});

export const AppointmentController = {
  bookAppointment,
};
