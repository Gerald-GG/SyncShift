const Joi = require('joi');

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors:  error.details.map(d => d.message),
    });
  }
  next();
};

const registerSchema = Joi.object({
  name:     Joi.string().min(2).max(120).required(),
  email:    Joi.string().email().required(),
  phone:    Joi.string().max(30).optional().allow(''),
  password: Joi.string().min(8).required(),
});

const loginSchema = Joi.object({
  email:    Joi.string().email().required(),
  password: Joi.string().required(),
});

module.exports = {
  validateRegister: validate(registerSchema),
  validateLogin:    validate(loginSchema),
};
