import { StatusCodes } from "http-status-codes";
import { AuthProvider, UserStatus } from "../../../../generated/enums";
import AppError from "../../utils/AppError";
import { generateOtp } from "../../utils/generateOpt";
import { prisma } from "../../lib/prisma";
import { redisClient } from "../../lib/redis";
import type {
	IForgotPasswordPayload,
	IResetPasswordPayload,
} from "./auth.interface";
import { hashPassword } from "../../utils/hashPassword";
import nodemailer from "nodemailer";
import { transporter } from "../../lib/nodemailer";
import envConfig from "../../config/envConfig";
import ejs from "ejs";
import path from "path";

const forgotPassword = async (payload: IForgotPasswordPayload) => {
	const { email } = payload;
	const user = await prisma.user.findUnique({
		where: {
			email,
		},
		include: {
			authAccounts: true,
		},
	});

	if (!user) {
		throw new AppError(StatusCodes.NOT_FOUND, "User not found");
	}

	if (user.status === UserStatus.PENDING) {
		throw new AppError(StatusCodes.BAD_REQUEST, "User not approved");
	}

	if (user.status === UserStatus.BLOCKED) {
		throw new AppError(StatusCodes.BAD_REQUEST, "User is blocked");
	}

	if (user.status === UserStatus.SUSPENDED) {
		throw new AppError(StatusCodes.BAD_REQUEST, "User is suspended");
	}

	const hasCredentialAccount = user.authAccounts.some(
		(account) => account.provider === AuthProvider.CREDENTIAL,
	);

	if (!hasCredentialAccount) {
		throw new AppError(
			StatusCodes.BAD_REQUEST,
			"This account does not support password reset",
		);
	}

	const otp = generateOtp();

	const key = `forgot_password:${email}`;
	const expiration = Number(envConfig.RESET_PASS_OTP_EXPIRATION_MINUTE);

	await redisClient.set(key, otp, {
		expiration: {
			type: "EX",
			value: expiration * 60,
		},
	});

	console.log(otp);

	const templatePath = path.join(
		process.cwd(),
		"src/app/templates/forgot-password.ejs",
	);
	const templateData = {
		name: user.name,
		otp,
		expiration,
	};
	const html = await ejs.renderFile(templatePath, templateData);

	await transporter.sendMail({
		from: envConfig.SMTP_SENDER,
		to: email,
		subject: "Forgot Password OTP",
		html,
	});

	return {};
};

const resetPassword = async (payload: IResetPasswordPayload) => {
	const { email, newPassword, otp } = payload;
	const user = await prisma.user.findUnique({
		where: {
			email,
		},
		include: {
			authAccounts: true,
		},
	});

	if (!user) {
		throw new AppError(StatusCodes.NOT_FOUND, "User not found");
	}

	if (user.status === UserStatus.PENDING) {
		throw new AppError(StatusCodes.BAD_REQUEST, "User not approved");
	}

	if (user.status === UserStatus.BLOCKED) {
		throw new AppError(StatusCodes.BAD_REQUEST, "User is blocked");
	}

	if (user.status === UserStatus.SUSPENDED) {
		throw new AppError(StatusCodes.BAD_REQUEST, "User is suspended");
	}

	const hasCredentialAccount = user.authAccounts.some(
		(account) => account.provider === AuthProvider.CREDENTIAL,
	);

	if (!hasCredentialAccount) {
		throw new AppError(
			StatusCodes.BAD_REQUEST,
			"This account does not support password reset",
		);
	}

	if (!otp) {
		throw new AppError(StatusCodes.NOT_FOUND, "OTP is not provided");
	}

	const key = `forgot_password:${payload.email}`;

	const redisOtp = await redisClient.get(key);

	if (otp !== redisOtp) {
		throw new AppError(StatusCodes.BAD_REQUEST, "OTP not match");
	}

	const hashedPassword = await hashPassword(newPassword);

	const result = await prisma.authAccount.update({
		where: {
			userId_provider: {
				userId: user.id,
				provider: AuthProvider.CREDENTIAL,
			},
		},
		data: {
			password: hashedPassword,
		},
	});

	await redisClient.del(key);

	const templatePath = path.join(
		process.cwd(),
		"src/app/templates/success-reset-password.ejs",
	);

	const html = await ejs.renderFile(templatePath, {
		appName: envConfig.SERVER_NAME?.toUpperCase(),
		name: user.name,
		changedAt: result.updatedAt,
		email: user.email,
	});

	await transporter.sendMail({
		from: envConfig.SMTP_SENDER,
		to: email,
		subject: "Change Password",
		html,
	});
};

export const AuthService = {
	forgotPassword,
	resetPassword,
};
