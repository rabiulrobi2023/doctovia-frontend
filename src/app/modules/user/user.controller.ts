import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { UserService } from "./user.service";

const updateUserProfilePhoto = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const buffer = req?.file?.buffer;

  const result = await UserService.updateUserProfilePhoto(
    buffer as Buffer,
    userId,
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    message: "Account registration successfully",
    data: result,
  });
});

export const UserController = { updateUserProfilePhoto };
