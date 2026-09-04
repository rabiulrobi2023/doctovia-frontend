import { StatusCodes } from "http-status-codes";
import envConfig from "../../config/envConfig";
import { getBkashToken } from "../../lib/bkash";
import AppError from "../../utils/AppError";
import { BkashPaymentStatus } from "./payment.interface";

const bkashPaymentCallback = async (
  paymentId: string,
  status?: BkashPaymentStatus,
) => {
  const bkashIdToken = await getBkashToken();
  console.log(bkashIdToken);
  if (!paymentId) {
    throw new AppError(StatusCodes.BAD_GATEWAY, "Payment missing");
  }
  if (!bkashIdToken) {
    throw new AppError(StatusCodes.BAD_REQUEST, "bKash token not found");
  }
  const executePayment = await fetch(
    `${envConfig.BKASH_SANDBOX_BASE_URL}/tokenized/checkout/execute`,

    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        authorization: bkashIdToken,
        "x-app-key": envConfig.BKASH_SANDBOX_APP_KEY as string,
      },
      body: JSON.stringify({
        paymentID: paymentId,
      }),
    },
  );
  const result = await executePayment.json();

  if (status === BkashPaymentStatus.SUCCESS) {
    return {
      redirectUrl: `${envConfig.FRONTEND_URL}/dashboard/my-appointments?status=${status}`,
      data: result,
    };
  } else if (status === BkashPaymentStatus.FAILURE) {
    return {
      redirectUrl: `${envConfig.FRONTEND_URL}/dashboard/my-appointments?status=${status}`,
      data: result,
    };
  } else if (status === BkashPaymentStatus.CANCEL) {
    return {
      redirectUrl: `${envConfig.FRONTEND_URL}/dashboard/my-appointments?status=${status}`,
      data: result,
    };
  }
  return {
    redirectUrl: `${envConfig.FRONTEND_URL}/dashboard/my-appointments`,
  };
};
export const PaymentService = {
  bkashPaymentCallback,
};
