import envConfig from "../config/envConfig";
import { redisClient } from "./redis";

export const getBkashToken = async () => {
  const bkashIdTokenKey = `bkash:idToken`;
  const bkashRefreshTokenKey = `bkash:refreshToken`;

  let bkashIdToken = await redisClient.get(bkashIdTokenKey);
  const bkashRefreshToken = await redisClient.get(bkashRefreshTokenKey);
  const bkashIdTokenTTL = await redisClient.ttl(bkashIdTokenKey);
  const bkashRefreshTokenTTL = await redisClient.ttl(bkashRefreshTokenKey);

  if (
    bkashIdTokenTTL <= 120 &&
    bkashRefreshToken &&
    bkashRefreshTokenTTL > 600
  ) {
    const response = await fetch(
      `${envConfig.BKASH_SANDBOX_BASE_URL}/tokenized/checkout/token/refresh`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          username: envConfig.BKASH_SANDBOX_USERNAME as string,
          password: envConfig.BKASH_SANDBOX_PASSWORD as string,
        },
        body: JSON.stringify({
          app_key: envConfig.BKASH_SANDBOX_APP_KEY,
          app_secret: envConfig.BKASH_SANDBOX_APP_SECRET,
          refresh_token: bkashRefreshToken,
        }),
      },
    );

    const result = await response.json();

    redisClient.set(bkashIdTokenKey, result.id_token, {
      expiration: {
        type: "EX",
        value: 60 * 60,
      },
    });
    bkashIdToken = result.id_token;
  }

  if (bkashIdToken) {
    return bkashIdToken;
  } else {
    const response = await fetch(
      `${envConfig.BKASH_SANDBOX_BASE_URL}/tokenized/checkout/token/grant`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          username: envConfig.BKASH_SANDBOX_USERNAME as string,
          password: envConfig.BKASH_SANDBOX_PASSWORD as string,
        },
        body: JSON.stringify({
          app_key: envConfig.BKASH_SANDBOX_APP_KEY,
          app_secret: envConfig.BKASH_SANDBOX_APP_SECRET,
        }),
      },
    );

    const result = await response.json();
    await redisClient.set(bkashIdTokenKey, result.id_token, {
      expiration: {
        type: "EX",
        value: 60 * 60,
      },
    });
    await redisClient.set(bkashRefreshTokenKey, result.refresh_token, {
      expiration: {
        type: "EX",
        value: 28 * 24 * 60 * 60,
      },
    });
    return result.id_token;
  }
};
