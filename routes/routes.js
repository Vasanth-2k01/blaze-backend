const routes = require("express-promise-router")();
const { validateBody,validateQuery,authenticateJwt,authenticateUser } = require("../utils/helpers");
const { schemas } = require("../routevalidations/user");
const controller = require("../controllers/user");
const passport = require("passport");
const passportConfig = require("../config/passport.js");

routes.post(
  "/login",
  validateBody(schemas.loginSchema),
  authenticateUser,
  controller.Login
);

routes.get(
  "/getProfile",
  authenticateJwt,
  controller.convertCurrency
);

routes.get(
  "/convertCurrency",
  authenticateJwt,
  validateQuery(schemas.convertCurrencySchema),
  controller.convertCurrency
);

routes.get(
  "/generateCurrencyConversionPdf",
  authenticateJwt,
  validateQuery(schemas.convertCurrencySchema),
  controller.generateCurrencyConversionPdf
);

routes.get(
  "/getCurrencyConversionHistory",
  authenticateJwt,
  validateQuery(schemas.getCurrencyConversionHistorySchema),
  controller.getCurrencyConversionHistory
);

module.exports = routes;
