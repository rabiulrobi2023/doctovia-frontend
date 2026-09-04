import express, { type Application, type Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import envConfig from "./app/config/envConfig";
import catchAsync from "./app/utils/catchAsync";
import { redisClient } from "./app/lib/redis";
import sendResponse from "./app/utils/sendResponse";
import notFoundRoute from "./app/middlewares/notFoundRoute";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import router from "./app/router";
import { getBkashToken } from "./app/lib/bkash";

const app: Application = express();

app.use(cors({ origin: envConfig.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (_req, res: Response) => {
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: `Welcome to ${envConfig.SERVER_NAME} API`,
    data: {
      name: envConfig.SERVER_NAME,
      version: "v1",
      status: "Running",
      environment: envConfig.NODE_ENV,
      timestamp: new Date().toISOString(),
    },
  });
});

app.post(
  "/api/v1/bkash-token",
  catchAsync(async (req, res, next) => {
    const result = await getBkashToken();
    sendResponse(res, {
      statusCode: 200,
      message: "Operation successful",
      data: result,
    });
  }),
);

app.use("/api/v1", router);
app.use(notFoundRoute);
app.use(globalErrorHandler);

export default app;
