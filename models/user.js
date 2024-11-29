var JWT = require("jsonwebtoken");
var knex = require("../DB.js");
const { CustomError } = require("../utils/index");
const { generatePdfData } = require("../utils/pdf.js");
class Users {
  static signToken = (user) => {
    const currentTime = Math.floor(new Date().getTime() / 1000);
    const expiresIn = 5 * 60;

    return JWT.sign(
      {
        iss: process.env.JWT_ISS,
        sub: user.id,
        iat: currentTime,
        exp: currentTime + expiresIn,
      },
      process.env.JWT_SECRET
    );
  };

  static async convertCurrency(req) {
    try {
      console.log(req.query, "req.query");

      let exchangeRate = await fetch(
        `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_RATE_API_KEY}/latest/${req.query.source_currency}`
      ).then((res) => res.json());

      console.log(exchangeRate, "exchangeRate");

      if (!exchangeRate.result === "success") {
        return {
          success: false,
          message: "Currency conversion failed",
          data: {},
        };
      }

      if (!exchangeRate.conversion_rates[req.query.target_currency]) {
        return {
          success: false,
          message: "Target currency not found",
          data: {},
        };
      }

      let convertedAmount =
        parseFloat(req.query.amount) *
        parseFloat(exchangeRate.conversion_rates[req.query.target_currency]);

      let result = await knex(process.env.CURRENCY_CONVERSION_HISTORY)
        .insert({
          source_currency: req.query.source_currency,
          target_currency: req.query.target_currency,
          amount: req.query.amount,
          converted_amount: convertedAmount,
          created_by: req.user.id,
        })
        .returning("*");

      if (!result) {
        return {
          success: false,
          message: "Currency conversion failed",
          data: {},
        };
      }

      return {
        success: true,
        message: "Currency converted successfully",
        data: {
          source_currency: req.body.source_currency,
          target_currency: req.body.target_currency,
          amount: req.body.amount,
          converted_amount: convertedAmount,
        },
      };
    } catch (error) {
      console.log(error);
      throw new CustomError(error.message, 500, {});
    }
  }

  static async generateCurrencyConversionPdf(req) {
    try {
      console.log(req.query, "req.query");

      let exchangeRate = await fetch(
        `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_RATE_API_KEY}/latest/${req.query.source_currency}`
      ).then((res) => res.json());

      console.log(exchangeRate, "exchangeRate");

      if (!exchangeRate.result === "success") {
        return {
          success: false,
          message: "Currency conversion failed",
          data: {},
        };
      }

      if (!exchangeRate.conversion_rates[req.query.target_currency]) {
        return {
          success: false,
          message: "Target currency not found",
          data: {},
        };
      }

      let convertedAmount =
        parseFloat(req.query.amount) *
        parseFloat(exchangeRate.conversion_rates[req.query.target_currency]);

        let pdf = await generatePdfData({
          source_currency: req.query.source_currency,
          target_currency: req.query.target_currency,
          amount: req.query.amount,
          converted_amount: convertedAmount,
          conversion_time: new Date(),
        });

        console.log(pdf, "pdf");
        if (pdf.success) {
          return {
            success: true,
            message: "Pdf generated successfully",
            data: pdf.data,
          };
        } else {
          return {
            success: false,
            message: "Pdf generation failed",
            data: {},
          };
        }
    } catch (error) {
      console.log(error);
      throw new CustomError(error.message, 500, {});
    }
  }

  static async getCurrencyConversionHistory(req, page, limit, offsets) {
    try {
      let result = await knex(process.env.CURRENCY_CONVERSION_HISTORY)
        .select([
          `${process.env.CURRENCY_CONVERSION_HISTORY}.*`,
          knex.raw("COUNT(*) OVER () AS rowcount"),
        ])
        .limit(limit)
        .offset(offsets)
        .orderBy("created_at", "desc")
        .where("created_by", req.user.id);

        console.log(result,"result");
        
      if (result && result.length) {
        return {
          success: true,
          message: "Currency conversion history listed successfully",
          data: result,
        };
      } else {
        return {
          success: true,
          message: "No Record Found",
          data: {},
        };
      }
    } catch (error) {
      console.log(error);
      throw new CustomError(error.message, 500, {});
    }
  }
}

module.exports = Users;
