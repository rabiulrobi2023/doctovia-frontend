import { StatusCodes } from "http-status-codes";
import { AuthProvider, UserStatus } from "../../../../generated/enums";
import AppError from "../../utils/AppError";
import { generateOtp } from "../../utils/generateOpt";
import { prisma } from "../../lib/prisma";
import { redisClient } from "../../lib/redis";
import type {
  IForgotPasswordPayload,
  IJwtPayload,
  IRegisterPatientPayload,
  IResetPasswordPayload,
  IVerifyPatientEmailPayload,
} from "./auth.interface";
import { hashPassword } from "../../utils/hashPassword";
import { transporter } from "../../lib/nodemailer";
import envConfig from "../../config/envConfig";
import ejs from "ejs";
import path from "path";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt";
import bcrypt from "bcryptjs";

const registerPatient = async (payload: IRegisterPatientPayload) => {
  const { name, email, password } = payload;
  const hashedPassword = await hashPassword(password);

  const isCredentialUser = await prisma.authAccount.findFirst({
    where: {
      provider: AuthProvider.CREDENTIAL,
      user: {
        email,
      },
    },
    include: {
      user: true,
    },
    omit: {
      password: true,
    },
  });

  const isGoogleUser = await prisma.authAccount.findFirst({
    where: {
      provider: AuthProvider.GOOGLE,
      user: {
        email,
      },
    },
    include: {
      user: true,
    },
    omit: {
      password: true,
    },
  });

  if (isCredentialUser) {
    const userInfo = isCredentialUser.user;
    if (userInfo.isDeleted) {
      throw new AppError(StatusCodes.BAD_REQUEST, "The account is deleted");
    }
    if (userInfo.status === UserStatus.BLOCKED) {
      throw new AppError(StatusCodes.BAD_REQUEST, "User is blocked");
    }
    if (userInfo.status === UserStatus.SUSPENDED) {
      throw new AppError(StatusCodes.BAD_REQUEST, "User is suspended");
    }
    throw new AppError(StatusCodes.CONFLICT, "User already exist");
  } else if (isGoogleUser) {
    const userInfo = isGoogleUser.user;
    if (userInfo.isDeleted) {
      throw new AppError(StatusCodes.BAD_REQUEST, "The account is deleted");
    }
    if (userInfo.status === UserStatus.BLOCKED) {
      throw new AppError(StatusCodes.BAD_REQUEST, "User is blocked");
    }
    if (userInfo.status === UserStatus.SUSPENDED) {
      throw new AppError(StatusCodes.BAD_REQUEST, "User is suspended");
    }

    const result = await prisma.authAccount.create({
      data: {
        password: hashedPassword,
        provider: AuthProvider.CREDENTIAL,
        providerAccountId: email,
        userId: userInfo.id,
      },
      include: {
        user: true,
      },
      omit: {
        password: true,
      },
    });

    return result;
  } else {
    const expirationMinutes = Number(envConfig.REGISTER_AC_EXPIRATION_MINUTE);
    const expirationSeconds = expirationMinutes * 60;

    const otpKey = `patient-registration-otp:${email}`;
    const otp = generateOtp();

    await redisClient.set(otpKey, otp, {
      expiration: {
        type: "EX",
        value: expirationSeconds,
      },
    });

    const patientRegistrationKey = `patient-registration-data:${email}`;
    const patientRegistrationValue = JSON.stringify({
      name,
      email,
      password: hashedPassword,
    });

    await redisClient.set(patientRegistrationKey, patientRegistrationValue, {
      expiration: { type: "EX", value: expirationSeconds },
    });

    const templatePath = path.join(
      process.cwd(),
      "/src/app/templates/register-patient.ejs",
    );

    const templateData = {
      name,
      otp,
      expirationMinutes,
    };
    const html = await ejs.renderFile(templatePath, templateData);

    await transporter.sendMail({
      from: envConfig.SMTP_SENDER,
      to: email,
      subject: "Email verification",
      html,
    });

    return null;
  }
};

const verifyEmailAndCreatePatient = async (
  payload: IVerifyPatientEmailPayload,
) => {
  const { email, otp } = payload;

  const patientRegistrationKey = `patient-registration-data:${email}`;
  const otpKey = `patient-registration-otp:${email}`;

  const [redisOtp, patientData] = await Promise.all([
    redisClient.get(otpKey),
    redisClient.get(patientRegistrationKey),
  ]);

  if (!redisOtp) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "OTP has expired or is invalid",
    );
  }

  if (!patientData) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Registration data has expired. Please register again",
    );
  }

  if (otp !== redisOtp) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Invalid OTP. Please enter the correct OTP",
    );
  }

  const parchedPatientData: IRegisterPatientPayload = JSON.parse(patientData);

  const { name, email: patientEmail, password } = parchedPatientData;

  const createUser = await prisma.user.create({
    data: {
      name,
      email: patientEmail,
      isEmailVerified: true,
      authAccounts: {
        create: {
          provider: AuthProvider.CREDENTIAL,
          providerAccountId: patientEmail,
          password,
        },
      },
    },
  });

  await Promise.all([
    redisClient.del(otpKey),
    redisClient.del(patientRegistrationKey),
  ]);

  const templatePath = path.join(
    process.cwd(),
    "src/app/templates/patient-email-verified.ejs",
  );
  const templateData = {
    name: name,
  };
  const html = await ejs.renderFile(templatePath, templateData);

  await transporter.sendMail({
    from: envConfig.SMTP_SENDER,
    to: email,
    subject: "Email Verified Successfully",
    html,
  });

  const jwtPayload: IJwtPayload = {
    id: createUser.id,
    name,
    email,
    role: createUser.role,
  };

  const accessToken = generateAccessToken(jwtPayload);
  const refreshToken = generateRefreshToken(jwtPayload);

  return {
    user: createUser,
    accessToken,
    refreshToken,
  };
};

const credentialLogin = async (email: string, password: string) => {
  if (!email || !password) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Email or password missing");
  }
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }

  if (user.status === UserStatus.SUSPENDED) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "Your account has been suspended",
    );
  }

  if (user.status === UserStatus.BLOCKED) {
    throw new AppError(StatusCodes.FORBIDDEN, "Your account has been blocked");
  }

  const authAccount = await prisma.authAccount.findUnique({
    where: {
      provider_providerAccountId: {
        provider: AuthProvider.CREDENTIAL,
        providerAccountId: email,
      },
    },
    select: {
      password: true,
    },
  });

  const isPasswordMatched = await bcrypt.compare(
    password,
    authAccount?.password as string,
  );

  if (!isPasswordMatched) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid password");
  }
  const jwtTokenPayload: IJwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = generateAccessToken(jwtTokenPayload);
  const refreshToken = generateRefreshToken(jwtTokenPayload);
  return {
    accessToken,
    refreshToken,
  };
};

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

  return null;
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
  registerPatient,
  verifyEmailAndCreatePatient,
  credentialLogin,
  forgotPassword,
  resetPassword,
};
