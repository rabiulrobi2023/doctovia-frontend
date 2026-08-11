import type { Response } from "express";
import ms, { type StringValue } from "ms";

import { NodeEnv } from "../const";
import envConfig from "../config/envConfig";

export const setAccessTokenIntoCookie = (res: Response, token: string) => {
	const maxAge = ms(envConfig.JWT_ACCESS_TOKEN_EXPIRE_IN as StringValue);
	tokenSetHelper(res, "accessToken", token, maxAge);
};

export const setRefreshTokenIntoCookie = (res: Response, token: string) => {
	const maxAge = ms(envConfig.JWT_REFRESH_TOKEN_EXPIRE_IN as StringValue);
	tokenSetHelper(res, "refreshToken", token, maxAge);
};

const tokenSetHelper = (
	res: Response,
	tokenName: string,
	token: string,
	maxAge: number,
) => {
	res.cookie(tokenName, token, {
		httpOnly: true,
		secure: envConfig.NODE_ENV === NodeEnv.PRODUCTION,
		sameSite: "lax",
		maxAge,
	});
};
