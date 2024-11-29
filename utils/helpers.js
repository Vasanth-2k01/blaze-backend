const bcrypt = require("bcrypt");
require("dotenv").config();
const { CustomError } = require("./index");
const { BaseURL } = require("../utils/config");
const passport = require("passport");

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

  validateBody : (schema) => {
    return async (req, res, next) => {
      try {
        const result = await schema.validateAsync(req.body, {
          abortEarly: true,
          context: req,
        });
        // console.log(result, "result");
        return next();
      } catch (error) {
        console.log(error , "validateBody err");
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

  validateQuery : (schema) => {
    return async (req, res, next) => {
      try {
        const result = await schema.validateAsync(req.query, {
          abortEarly: true,
          context: req,
        });
        // console.log(result, "result");
        return next();
      } catch (error) {
        console.log(error , "validateBody err");
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

  GetAllList : (
    body,
    results,
    rowcount,
    page,
    limit,
    offsets,
    link
  ) => {
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

  authenticateJwt : (req, res, next) => {
    if (req.headers.authorization)
      req.headers.authorization = req.headers.authorization
        .replace("Bearer", "")
        .trim();
    console.log("authenticateJwt",req.headers.authorization);
    passport.authenticate("jwtProfile", function (err, payload, info) {
      if (err) {
        console.log("err", err);
        return res.status(401).send(err);
      } //console.log(" err", err);
      else if (!payload) {
        console.log(payload,"payload");
        
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
  authenticateUser : (req, res, next) => {
    passport.authenticate("local", function (err, payload, info) {
      if (err) {
        console.log("err", err);
        return res.status(401).send(err);
      } 
      else if (!payload) {
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
  }
};
