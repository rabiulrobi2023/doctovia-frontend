import express, { type Application, type Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "./app/config/envConfig";
import router from "./app/router";

const app: Application = express();

app.use(cors({ origin: config.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (_req, res: Response) => {
	res.status(200).json({
		success: true,
		statusCode: 200,
		message: `Welcome to ${config.SERVER_NAME} Doctovia API`,
		data: {
			name: config.SERVER_NAME,
			version: "v1",
			status: "Running",
			environment: config.NODE_ENV,
			timestamp: new Date().toISOString(),
		},
	});
});

app.use("/api/v1", router);

export default app;
