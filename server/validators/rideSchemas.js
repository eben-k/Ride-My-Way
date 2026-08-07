import Joi from 'joi';

export const createRideSchema = Joi.object({
  driver: Joi.string().min(2).required(),
  car: Joi.string().min(2).required(),
  from: Joi.string().min(2).required(),
  to: Joi.string().min(2).required(),
  departureTime: Joi.string().isoDate().required(),
  seats: Joi.number().integer().min(1).required(),
});

export const joinRequestSchema = Joi.object({
  passenger: Joi.string().min(2).required(),
});
