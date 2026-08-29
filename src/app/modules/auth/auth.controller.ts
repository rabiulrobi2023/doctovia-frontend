import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AuthService } from "./auth.service";

const registerPatient = catchAsync(async (req, res, next) => {
  const payload = req.body;

  const result = await AuthService.registerPatient(payload);
  if (!result) {
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: `An OTP sent to ${payload.email}`,
      data: result,
    });
  }

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    message: "Credential account register successfully",
    data: result,
  });
});

const verifyEmailAndCreatePatient = catchAsync(async (req, res, next) => {
  const payload = req.body;

  const result = await AuthService.verifyEmailAndCreatePatient(payload);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    message: "Account registration successfully",
    data: result,
  });
});

const forgotPassword = catchAsync(async (req, res, next) => {
  const payload = req.body;
  const result = await AuthService.forgotPassword(payload);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    message: `An OTP sent to ${payload.email}`,
    data: result,
  });
});
const resetPassword = catchAsync(async (req, res, next) => {
  const payload = req.body;
  await AuthService.resetPassword(payload);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    message: "Password updated successfully",
    data: null,
  });
});

export const AuthController = {
  verifyEmailAndCreatePatient,
  registerPatient,
  forgotPassword,
  resetPassword,
};
