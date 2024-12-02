const bcrypt = require("bcrypt");
require("dotenv").config();
const { CustomError } = require("./index");
const { BaseURL } = require("../utils/config");
const passport = require("passport");
const fs = require("fs");
const htmlPdf = require("html-pdf-node");
const Handlebars = require("handlebars");
const puppeteer = require("puppeteer");
const path = require("path");
const moment = require("moment");
const sharp = require("sharp");

module.exports = {
  encryptPWD: async (password) => {
    try {
      const hash = await bcrypt.hash(
        password,
        parseInt(process.env.SALT_ROUNDS)
      );
      console.log(hash, "hash", parseInt(process.env.SALT_ROUNDS));
      return hash;
    } catch (err) {
      console.error("encryptPWD", err);
      throw new CustomError(err, 500, {});
    }
  },

  comparePWD: async (password, hashedPassword) => {
    try {
      const isCorrect = await bcrypt.compare(password, hashedPassword);
      if (isCorrect) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.error("comparePWD", err);
      throw new CustomError(err, 500, {});
    }
  },

  validateBody: (schema) => {
    return async (req, res, next) => {
      try {
        const result = await schema.validateAsync(req.body, {
          abortEarly: true,
          context: req,
        });
        // console.log(result, "result");
        return next();
      } catch (error) {
        console.log(error, "validateBody err");
        const message = `${
          error.details && error.details[0]
            ? error.details[0].context.message || error.details[0].message
            : "Unknown validation error"
        }`;
        const code =
          error.details &&
          error.details[0] &&
          error.details[0].context &&
          error.details[0].context.code
            ? error.details[0].context.code
            : 422;
        // console.log("Message",code, message);
        throw new CustomError(message, code, error.details);
      }
    };
  },

  validateQuery: (schema) => {
    return async (req, res, next) => {
      try {
        const result = await schema.validateAsync(req.query, {
          abortEarly: true,
          context: req,
        });
        // console.log(result, "result");
        return next();
      } catch (error) {
        console.log(error, "validateBody err");
        const message = `${
          error.details && error.details[0]
            ? error.details[0].context.message || error.details[0].message
            : "Unknown validation error"
        }`;
        const code =
          error.details &&
          error.details[0] &&
          error.details[0].context &&
          error.details[0].context.code
            ? error.details[0].context.code
            : 422;
        // console.log("Message",code, message);
        throw new CustomError(message, code, error.details);
      }
    };
  },

  GetAllList: (body, results, rowcount, page, limit, offsets, link) => {
    try {
      let data = {
        data: results,
        current_page: page,
        path: `${BaseURL}/api/${link}`,
        from: page == 1 && !results.length ? 0 : (page - 1) * limit + 1,
        to: (page - 1) * limit + results.length,
        last_page:
          results.length > 0
            ? parseInt(Math.ceil(parseFloat(rowcount / limit)))
            : null,
        first_page_url: `${BaseURL}/api/${link}?page=1`,
        last_page_url:
          results.length > 0
            ? `${BaseURL}/api/${link}?page=${parseInt(
                Math.ceil(parseFloat(rowcount / limit))
              )}`
            : null,
        next_page_url:
          results.length > 0
            ? parseInt(Math.ceil(parseFloat(rowcount / limit))) > page
              ? `${BaseURL}/api/${link}?page=${page + 1}`
              : null
            : null,
        prev_page_url:
          page - 1 > 0 ? `${BaseURL}/api/${link}?page=${page - 1}` : null,
        per_page: limit,
        total: results.length > 0 ? parseInt(rowcount) : 0,
      };
      data = { ...data };
      return data;
    } catch (err) {
      console.log("error", err);
      throw new CustomError(err.message, 500, null);
    }
  },

  authenticateJwt: (req, res, next) => {
    if (req.headers.authorization)
      req.headers.authorization = req.headers.authorization
        .replace("Bearer", "")
        .trim();
    console.log("authenticateJwt", req.headers.authorization);
    passport.authenticate("jwtProfile", function (err, payload, info) {
      if (err) {
        console.log("err", err);
        return res.status(401).send(err);
      } //console.log(" err", err);
      else if (!payload) {
        console.log(payload, "payload");

        return res
          .status(401)
          .send({ status: 0, message: "authentication failed", result: {} });
      } else {
        console.log("authenticateJwt payload", payload);
        next();
        return;
      }
    })(req, res, next);
  },
  authenticateUser: (req, res, next) => {
    passport.authenticate("local", function (err, payload, info) {
      if (err) {
        console.log("err", err);
        return res.status(401).send(err);
      } else if (!payload) {
        return res
          .status(401)
          .send({ status: 0, message: "authentication failed", result: {} });
      } else {
        console.log("authenticateJwt payload", payload);
        req.user = payload;
        next();
        return;
      }
    })(req, res, next);
  },

  generatePdf: async (pdfData, generateImage = false) => {
    try {
      console.log(pdfData, "pdfData");
      let templatePath = __dirname + "/currencyTemplate.html";

      const templateHtml = fs.readFileSync(templatePath, "utf8");
      const template = Handlebars.compile(templateHtml);

      Handlebars.registerHelper("incrementIndex", function (value) {
        return value + 1;
      });

      const html = template(pdfData);

      const options = {
        border: "10mm",
      };

      if (generateImage) {
        return html;
      } else {
        const pdfBuffer = await htmlPdf.generatePdf({ content: html }, options);

        console.log(pdfBuffer, "pdfBuffer");
        if (pdfBuffer) {
          return {
            success: true,
            message: "PDF generated successfully!",
            data: pdfBuffer,
          };
        } else {
          return {
            success: false,
            message: "PDF generated failed!",
            data: {},
          };
        }
      }
    } catch (error) {
      console.log(error);
      throw new CustomError(error, 400, {});
    }
  },

  generateImage: async (imageData) => {
    try {
      const imageName = `${imageData.user_id}-${imageData.source_currency}-${
        imageData.target_currency
      }-${moment(imageData.conversion_time, "DD-MM-YYYY HH:mm:ss:SSS").format(
        "YYYYMMDDHHmmss"
      )}`;

      let html = await module.exports.generatePdf(imageData, true);

      if (!html) {
        return {
          success: false,
          message: "Image generated failed!",
          data: {},
        };
      }

      const browser = await puppeteer.launch({
        args: [
          "--disable-setuid-sandbox",
          "--no-sandbox",
          "--single-process",
          "--no-zygote",
        ],
        executablePath:
          // process.env.PRODUCTION_MODE == "loc"
            // ?
             puppeteer.executablePath()
            // : process.env.PUPPETEER_EXECUTABLE_PATH,
      });

      const page = await browser.newPage();
      await page.setContent(html);

      const outputPath = path.join(
        "./uploads/currency-conversion-image",
        `${imageName}.png`
      );
      const imageBuffer = await page.screenshot({
        path: outputPath,
        fullPage: true,
      });

      const grayScaleOutputPath = path.join(
        "./uploads/currency-conversion-grayscale-image",
        `${imageName}.png`
      );

      await browser.close();

      if (!imageBuffer) {
        return null;
      }

      let grayScaleBuffer = await sharp(outputPath).grayscale().toBuffer();

      let grayScaleFile = await sharp(outputPath)
        .grayscale()
        .toFile(grayScaleOutputPath);

      if (!grayScaleFile) {
        return null;
      }

      return {
        imageName: imageName,
        imageBuffer: imageBuffer,
        grayScaleBuffer: await grayScaleBuffer,
      };
    } catch (error) {
      console.log(error);
      throw new CustomError(error, 400, {});
    }
  },
};
