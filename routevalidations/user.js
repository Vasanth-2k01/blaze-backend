const Joi = require("joi");
var knex = require("../DB.js");

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
    downloadSchema: Joi.object({
      id: Joi.string()
        .uuid()
        .required()
        .external(async (value, helpers) => {
          try {
            console.log(helpers.prefs.context, "helpers.prefs.context");

            let isIdExist = await knex(process.env.CURRENCY_CONVERSION_HISTORY)
              .where({
                id: value,
                created_by: helpers.prefs.context.user.id,
              })
              .first();

            console.log(isIdExist, "isIdExist");

            if (!isIdExist) {
              return helpers.error("any.invalid", {
                message: "Invalid id",
              });
            }

            helpers.prefs.context.query.exchange_rate_object = isIdExist;
          } catch (error) {
            console.log(error, "error");

            return helpers.error("any.error", {
              message: error.message,
            });
          }
        }),
      is_gray_scale: Joi.number().allow(0, 1, "", null).optional(),
    }),
    getCurrencyConversionHistorySchema: Joi.object({
      page: Joi.number().integer().min(1).default(1).optional(),
      limit: Joi.number().integer().min(1).default(10).optional(),
    }),
  },
};
