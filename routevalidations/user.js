const Joi = require("joi");

module.exports = {
  schemas: {
    loginSchema: Joi.object({
      email: Joi.alternatives()
        .try(
          Joi.string()
            .pattern(/^[0-9]+$/)
            .message("Invalid Mobile Number"),
          Joi.string().email().message("or Invalid Email Address").max(255)
        )
        .required(),
      password: Joi.string()
        .trim()
        .pattern(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,15}$/
        )
        .message(
          "Password must be 8 to 15 characters long and contain at least one uppercase letter, one lowercase letter, one number and one special character."
        )
        .required(),
    }),
    convertCurrencySchema: Joi.object({
      source_currency: Joi.string().required(),
      target_currency: Joi.string().required(),
      amount: Joi.number().required().min(1),
    }),
    getCurrencyConversionHistorySchema: Joi.object({
      page: Joi.number().integer().min(1).default(1).optional(),
      limit: Joi.number().integer().min(1).default(10).optional(),
    }),
  },
};
