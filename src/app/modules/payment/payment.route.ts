import { Router } from "express";
import { PaymentController } from "./payment.controller";


const router = Router();
router.post("/bkash-token",PaymentController.getBkashTokenController)
router.get("/callback", PaymentController.bkashPaymentCallback);

export const PaymentRouter = router