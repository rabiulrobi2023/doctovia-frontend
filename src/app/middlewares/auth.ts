import { StatusCodes } from "http-status-codes";
import { UserStatus, type Role } from "../../../generated/enums";
import { prisma } from "../lib/prisma";
import envConfig from "../config/envConfig";

import catchAsync from "../utils/catchAsync";
import { verifyJwtToken } from "../utils/jwt";
import AppError from "../utils/AppError";
import type { IJwtPayload } from "../modules/auth/auth.interface";

const auth = (...allowedRoles: Role[]) => {
  return catchAsync(async (req, _res, next) => {
    const accessToken =
      req.cookies?.accessToken ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.slice(7)
        : undefined);

    if (!accessToken) {
      throw new AppError(StatusCodes.UNAUTHORIZED, "Authentication required");
    }

    const decoded = verifyJwtToken(
      accessToken,
      envConfig.JWT_ACCESS_TOKEN_SECRET as string,
    );


    const user = await prisma.user.findUnique({
      where: {
        id: decoded.id,
      },
      select: {
        id: true,
        role: true,
        status: true,
      },
    });

    if (!user) {
      throw new AppError(StatusCodes.UNAUTHORIZED, "Authentication failed");
    }

    switch (user.status) {
      case UserStatus.INACTIVE:
        throw new AppError(StatusCodes.FORBIDDEN, "Your account is inactive");

      case UserStatus.SUSPENDED:
        throw new AppError(
          StatusCodes.FORBIDDEN,
          "Your account has been suspended",
        );

      case UserStatus.BLOCKED:
        throw new AppError(
          StatusCodes.FORBIDDEN,
          "Your account has been blocked",
        );
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      throw new AppError(
        StatusCodes.FORBIDDEN,
        "You do not have permission to perform this action",
      );
    }

    req.user = {
      ...decoded,
      role: user.role,
    } as IJwtPayload;

    next();
  });
};

export default auth;
