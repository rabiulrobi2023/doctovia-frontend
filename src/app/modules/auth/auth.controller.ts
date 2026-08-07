import type { NextFunction, Request, Response } from "express";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  console.log("This is auth controller");
};

export const AuthController = {
  createUser,
};
