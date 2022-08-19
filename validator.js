const Joi = require("@hapi/joi");

const registerValidator = (data) => {
  const schema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().required(),
    country: Joi.string().required(),
    password: Joi.string().required().min(6).max(50),
  });
  return schema.validate(data);
};

const loginValidator = (data) => {
  const schema = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().min(6).max(50).required(),
  });
  return schema.validate(data);
};

module.exports = {
  registerValidator,
  loginValidator,
};
