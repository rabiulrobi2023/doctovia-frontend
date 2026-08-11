import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join((process.cwd(), ".env")) });

console.log("path:", process.cwd(), ".env");

const envConfig = {
	PORT: Number(process.env.PORT || 5000),
	SERVER_NAME: process.env.SERVER_NAME,
	NODE_ENV: process.env.NODE_ENV,
	DATABASE_URL: process.env.DATABASE_URL,
	FRONTEND_URL: process.env.FRONTEND_URL,
	GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
	JWT_ACCESS_TOKEN_SECRET: process.env.JWT_ACCESS_TOKEN_SECRET as string,
	JWT_ACCESS_TOKEN_EXPIRE_IN: process.env.JWT_ACCESS_TOKEN_EXPIRE_IN as string,
	JWT_REFRESH_TOKEN_SECRET: process.env.JWT_REFRESH_TOKEN_SECRET as string,
	JWT_REFRESH_TOKEN_EXPIRE_IN: process.env
		.JWT_REFRESH_TOKEN_EXPIRE_IN as string,
};

export default envConfig;
