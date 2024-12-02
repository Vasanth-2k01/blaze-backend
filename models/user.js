var JWT = require("jsonwebtoken");
var knex = require("../DB.js");
const { CustomError } = require("../utils/index");
const { generatePdf, generateImage } = require("../utils/helpers.js");
const path = require("path");
const fs = require("fs").promises;
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
      console.log(req.query, "req.query", req.user);

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
          ...result[0],
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

      let pdf = await generatePdf({
        source_currency: req.query.exchange_rate_object.source_currency,
        target_currency: req.query.exchange_rate_object.target_currency,
        amount: req.query.exchange_rate_object.amount,
        converted_amount: req.query.exchange_rate_object.converted_amount,
        conversion_time: req.query.exchange_rate_object.conversion_time,
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

  static async generateCurrencyConversionImage(req) {
    try {
      console.log(
        req.query.exchange_rate_object,
        "req.query.exchange_rate_object.image"
      );

      if (!req.query.exchange_rate_object.image) {
        let image = await generateImage({
          source_currency: req.query.exchange_rate_object.source_currency,
          target_currency: req.query.exchange_rate_object.target_currency,
          amount: req.query.exchange_rate_object.amount,
          converted_amount: req.query.exchange_rate_object.converted_amount,
          conversion_time: req.query.exchange_rate_object.conversion_time,
          user_id: req.user.id,
        });

        console.log(image, "image");

        if (!image || !image.grayScaleBuffer || !image.imageBuffer) {
          return {
            success: false,
            message: "Image generation failed",
            data: {},
          };
        }

        let result = await knex(process.env.CURRENCY_CONVERSION_HISTORY)
          .where("id", req.query.exchange_rate_object.id)
          .update({
            image: image.imageName,
            gray_scale_image: image.imageName,
          });

        if (result) {
          return {
            success: true,
            message: "Image generated successfully",
            data:
              req.query.is_gray_scale == 1
                ? image.grayScaleBuffer
                : image.imageBuffer,
          };
        } else {
          return {
            success: false,
            message: "Image generation failed",
            data: {},
          };
        }
      } else {
        console.log("IMAGE ALREADY EXIST");

        const imagePath = path.join(
          `./uploads/${
            req.query.is_gray_scale == 1
              ? "currency-conversion-grayscale-image"
              : "currency-conversion-image"
          }`,
          `${
            req.query.is_gray_scale == 1
              ? req.query.exchange_rate_object.gray_scale_image
              : req.query.exchange_rate_object.image
          }.png`
        );

        console.log(imagePath, "imagePath");
        let imageBuffer = await fs.readFile(imagePath, (err, data) => {
          console.log(data, "data");
          return data;
        });

        console.log(imageBuffer, "imageBuffer");

        if (imageBuffer) {
          return {
            success: true,
            message: "Image generated successfully",
            data: imageBuffer,
          };
        } else {
          return {
            success: false,
            message: "Image generation failed",
            data: {},
          };
        }
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

      console.log(result, "result");

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
