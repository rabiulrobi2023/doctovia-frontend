import { getBkashToken } from "../../lib/bkash";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import type { BkashPaymentStatus } from "./payment.interface";
import { PaymentService } from "./payment.service";

const getBkashTokenController = catchAsync(async (req, res, next) => {
  const result = await getBkashToken();
  sendResponse(res, {
    statusCode: 200,
    message: "Operation successful",
    data: result,
  });
});

const bkashPaymentCallback = catchAsync(async (req, res, next) => {
  const paymentId = req.query.paymentID;
  const status = req.query.status;

  const result = await PaymentService.bkashPaymentCallback(
    paymentId as string,
    status as BkashPaymentStatus,
  );

  res.redirect(result.redirectUrl);
});

export const PaymentController = {
  getBkashTokenController,
  bkashPaymentCallback,
};
