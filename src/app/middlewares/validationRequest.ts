import type z from "zod";
import catchAsync from "../utils/catchAsync";

const validationRequest = (zodSchema: z.ZodObject) => {
  return catchAsync(async (req, res, next) => {
    if (req.body?.data) {
      req.body = JSON.parse(req.body.data);
    }

    const validateData = await zodSchema.parseAsync(req.body);

    req.body = validateData;

    next();
  });
};

export default validationRequest;
