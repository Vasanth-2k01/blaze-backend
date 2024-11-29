const Model = require("../models/user");
const { CustomError } = require("../utils/index");
const { GetAllList } = require("../utils/helpers");

module.exports = {
  Login: async (req, res, next) => {
    console.log("req.user", req.user, "req.user.id");
    if (!req.user.success) {
      throw new CustomError(req.user.message, 401, req.user.data);
    }

    let token = { id: req.user.data.id, expToken: 1 };
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Expose-Headers", "access_token");
    res.setHeader("access_token", Model.signToken(token));
    res.status(200).send({ status: 1, message: req.user.message, result: {} });
  },

  getProfile: async (req, res, next) => {
    if (req.user) {
      res.status(200).send({
        status: 1,
        message: "Profile fetched successfully",
        result: req.user,
      });
    } else {
      res.status(400).send({
        status: 0,
        message: results.message,
        result: {},
      });
    }
  },
  convertCurrency: async (req, res, next) => {
    let results = await Model.convertCurrency(req);
    if (results.success) {
      res.status(200).send({
        status: 1,
        message: results.message,
        result: results.data,
      });
    } else {
      res.status(400).send({
        status: 0,
        message: results.message,
        result: {},
      });
    }
  },

  generateCurrencyConversionPdf: async (req, res, next) => {
    let results = await Model.generateCurrencyConversionPdf(req);
    if (results.success) {
      res.status(200).send({
        status: 1,
        message: results.message,
        result: results.data,
      });
    } else {
      res.status(400).send({
        status: 0,
        message: results.message,
        result: {},
      });
    }
  },

  getCurrencyConversionHistory: async (req, res, next) => {
    var page = parseInt(req.query.page) || 1;
    var limit = parseInt(req.query.limit) || 10;
    var offsets = (page - 1) * limit;

    let results = await Model.getCurrencyConversionHistory(
      req,
      page,
      limit,
      offsets
    );
    if (results.success) {
      let resultSet = GetAllList(
        req.body,
        results.data,
        results.data && results.data.length ? results.data[0].rowcount : 0,
        page,
        limit,
        offsets,
        "getCurrencyConversionHistory"
      );
      res.status(200).send({
        status: 1,
        message: results.message,
        result: resultSet,
      });
    } else {
      res.status(400).send({
        status: 0,
        message: results.message,
        result: {},
      });
    }
  },
};
