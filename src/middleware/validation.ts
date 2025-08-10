import { Request, Response, NextFunction } from "express";
import Joi from "joi";

const registerUserSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  address: Joi.string().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().optional(),
});

const registerInstitutionSchema = Joi.object({
  institutionName: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  address: Joi.string().required(),
  password: Joi.string().min(6).required(),
  mitra: Joi.string().optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const validateUserRegister = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = registerUserSchema.validate(req.body);

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
export const validateInstitutionRegister = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = registerInstitutionSchema.validate(req.body);

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

export const validateLogin = (req: Request, res: Response, next: NextFunction): void => {
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
