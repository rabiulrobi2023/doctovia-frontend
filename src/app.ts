import express, { type Application, type Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import router from "./app/router";
import envConfig from "./app/config/envConfig";

const app: Application = express();

app.use(cors({ origin: envConfig.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (_req, res: Response) => {
	res.status(200).json({
		success: true,
		statusCode: 200,
		message: `Welcome to ${envConfig.SERVER_NAME} Doctovia API`,
		data: {
			name: envConfig.SERVER_NAME,
			version: "v1",
			status: "Running",
			environment: envConfig.NODE_ENV,
			timestamp: new Date().toISOString(),
		},
	});
});

app.use("/api/v1", router);

export default app;
