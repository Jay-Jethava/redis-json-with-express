const Joi = require("joi");

module.exports = {
  create: Joi.object().keys({
    id: Joi.number().allow(null),
    title: Joi.string().required(),
    body: Joi.string().required(),
    UserId: Joi.number().required(),
    createdAt: Joi.date(),
    updatedAt: Joi.date(),
  }),

  update: Joi.object().keys({
    title: Joi.string(),
    body: Joi.string(),
    createdAt: Joi.date(),
    updatedAt: Joi.date(),
  }),
};
