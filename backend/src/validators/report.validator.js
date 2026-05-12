const Joi = require('joi');

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.query, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors:  error.details.map(d => d.message),
    });
  }
  next();
};

const reportQuerySchema = Joi.object({
  preset: Joi.string().valid('week', '2weeks', 'month').optional(),
  from:   Joi.string().isoDate().optional(),
  to:     Joi.string().isoDate().optional(),
  export: Joi.string().valid('csv', 'pdf').optional(),
}).or('preset', 'from');

module.exports = { validateReportQuery: validate(reportQuerySchema) };
