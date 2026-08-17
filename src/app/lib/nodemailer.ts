import nodemailer from "nodemailer";
import envConfig from "../config/envConfig";

export const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: envConfig.SMTP_USERNAME,
		pass: envConfig.SMTP_PASS,
	},
});
