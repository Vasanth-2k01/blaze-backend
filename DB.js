require("dotenv").config();
const knex = require("knex");
const config = require("./knexfile");
const { DB } = require("./utils/config");
const environmentConfig = config[DB];

const connection = knex(environmentConfig);

module.exports = connection;
