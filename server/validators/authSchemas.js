import Joi from 'joi';

export const signupSchema = Joi.object({
  name: Joi.string().min(2).required(),
  username: Joi.string().alphanum().min(3).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().min(5).required(),
  password: Joi.string().min(8).required(),
});

export const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});
