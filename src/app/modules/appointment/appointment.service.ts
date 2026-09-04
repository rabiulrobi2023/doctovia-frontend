import { StatusCodes } from "http-status-codes";
import envConfig from "../../config/envConfig";
import { getBkashToken } from "../../lib/bkash";
import AppError from "../../utils/AppError";

const bookAppointment = async () => {
  const bkashIdToken = await getBkashToken();
  if (!bkashIdToken) {
    throw new AppError(StatusCodes.BAD_GATEWAY, "bKash token not found");
  }
  const bkashCheckout = await fetch(
    `${envConfig.BKASH_SANDBOX_BASE_URL}/tokenized/checkout/create`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: bkashIdToken,
        "X-APP-Key": envConfig.BKASH_SANDBOX_APP_KEY as string,
      },
      body: JSON.stringify({
        mode: "0011",
        payerReference: "01929918378",
        callbackURL: `${envConfig.BACKEND_URL}/payment/callback`,
        amount: "100",
        currency: "BDT",
        intent: "sale",
        merchantInvoiceNumber: "INV0008",
      }),
    },
  );
  const result = await bkashCheckout.json();
  return result;
};

export const AppointmentService = {
  bookAppointment,
};
