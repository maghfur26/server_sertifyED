import { Request, Response, NextFunction } from "express";
import Joi from "joi";

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  mitra: Joi.string().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const validateRegister = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { error } = registerSchema.validate(req.body);

  if (error) {
    res.status(400).json({
      success: false,
      message: "Validation error",
      errors: error.details.map((detail) => detail.message),
    });
    return;
  }

  next();
};

export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { error } = loginSchema.validate(req.body);

  if (error) {
    res.status(400).json({
      success: false,
      message: "Validation error",
      errors: error.details.map((detail) => detail.message),
    });
    return;
  }

  next();
};
