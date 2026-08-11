import type { ErrorRequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { ZodError } from "zod";
import jwt from "jsonwebtoken";
import { Prisma } from "../../../generated/client";

import envConfig from "../config/envConfig";
import { NodeEnv } from "../const";
import type { IErrorSource } from "../interface/interface";
import AppError from "../utils/AppError";

const globalErrorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
	let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
	let message = "Something went wrong";
	let source: IErrorSource[] = [];

	// App Error
	if (error instanceof AppError) {
		statusCode = error.statusCode;
		message = error.message;
	}

	// Zod Validation Error
	else if (error instanceof ZodError) {
		statusCode = StatusCodes.BAD_REQUEST;
		message = "Validation failed";

		source = error.issues.map((issue) => ({
			path: issue.path.join("."),
			message: issue.message,
		}));
	}

	// JWT Errors
	else if (error instanceof jwt.TokenExpiredError) {
		statusCode = StatusCodes.UNAUTHORIZED;
		message = "Token has expired";
	} else if (error instanceof jwt.JsonWebTokenError) {
		statusCode = StatusCodes.UNAUTHORIZED;
		message = "Invalid authentication token";
	}

	// Prisma Known Errors
	else if (error instanceof Prisma.PrismaClientKnownRequestError) {
		switch (error.code) {
			case "P2000":
				statusCode = StatusCodes.BAD_REQUEST;
				message = "The provided value is too long";
				break;

			case "P2001":
			case "P2025":
				statusCode = StatusCodes.NOT_FOUND;
				message = "The requested resource was not found";
				break;

			case "P2002": {
				statusCode = StatusCodes.CONFLICT;

				const target = error.meta?.target;

				if (Array.isArray(target)) {
					message = `${target.join(", ")} already exists`;
				} else {
					message = "A resource with the provided value already exists";
				}

				break;
			}

			case "P2003":
				statusCode = StatusCodes.BAD_REQUEST;
				message = "The operation violates a related resource constraint";
				break;

			case "P2004":
				statusCode = StatusCodes.BAD_REQUEST;
				message = "A database constraint was violated";
				break;

			case "P2005":
			case "P2006":
			case "P2007":
				statusCode = StatusCodes.BAD_REQUEST;
				message = "Invalid value provided";
				break;

			case "P2011":
				statusCode = StatusCodes.BAD_REQUEST;
				message = "A required field cannot be null";
				break;

			case "P2012":
				statusCode = StatusCodes.BAD_REQUEST;
				message = "A required value is missing";
				break;

			case "P2014":
				statusCode = StatusCodes.BAD_REQUEST;
				message = "The operation violates a required relation";
				break;

			case "P2016":
				statusCode = StatusCodes.BAD_REQUEST;
				message = "Invalid database query";
				break;

			case "P2020":
				statusCode = StatusCodes.BAD_REQUEST;
				message = "The provided value is out of range";
				break;

			case "P2021":
			case "P2022":
				statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
				message = "A database configuration error occurred";
				break;

			default:
				statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
				message = "A database error occurred";
		}
	}

	// Prisma Initialization Errors
	else if (error instanceof Prisma.PrismaClientInitializationError) {
		switch (error.errorCode) {
			case "P1000":
				statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
				message = "Database authentication failed";
				break;

			case "P1001":
				statusCode = StatusCodes.SERVICE_UNAVAILABLE;
				message = "Database server is unavailable";
				break;

			case "P1002":
				statusCode = StatusCodes.GATEWAY_TIMEOUT;
				message = "Database connection timed out";
				break;

			case "P1003":
				statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
				message = "Database configuration error";
				break;

			case "P1010":
				statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
				message = "Database access configuration error";
				break;

			case "P1017":
				statusCode = StatusCodes.SERVICE_UNAVAILABLE;
				message = "Database connection was closed";
				break;

			default:
				statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
				message = "Failed to initialize the database connection";
		}
	}

	// Prisma Unknown / Panic Errors
	else if (
		error instanceof Prisma.PrismaClientUnknownRequestError ||
		error instanceof Prisma.PrismaClientRustPanicError
	) {
		statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
		message = "An unexpected database error occurred";
	}

	// Prisma Validation Error
	else if (error instanceof Prisma.PrismaClientValidationError) {
		statusCode = StatusCodes.BAD_REQUEST;
		message = "Invalid database query";
	}

	// Generic Error
	else if (error instanceof Error) {
		statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
		message = "Something went wrong";
	}

	res.status(statusCode).json({
		success: false,
		statusCode,
		message,
		source,
		...(envConfig.NODE_ENV === NodeEnv.DEVELOPMENT && {
			stack: error instanceof Error ? error.stack : undefined,
		}),
	});
};

export default globalErrorHandler;
