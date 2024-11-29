const apiURL = {
  BaseURL:
    process.env.PRODUCTION_MODE === "loc"
      ? process.env.LOCAL_URL
      : process.env.PRODUCTION_MODE === "dev"
      ? process.env.DEV_URL
      : process.env.PRODUCTION_MODE === "live"
      ? process.env.LIVE_URL
      : "",
    DB:
    process.env.PRODUCTION_MODE === "loc"
    ? 'local'
    : process.env.PRODUCTION_MODE === "dev"
    ? 'development'
    : 'local'
};

module.exports = apiURL;
