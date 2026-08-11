import type { AnyZodObject } from "zod/v3";
import catchAsync from "../utils/catchAsync";

const validationRequest = (zodSchema: AnyZodObject) => {
  return catchAsync(async (req, res, next) => {
    if (req.body.data) {
      req.body = req.body(JSON.parse(req.body.dada));
    }

    await zodSchema.parseAsync(req.body);
    next();
  });
};

export default validationRequest;
