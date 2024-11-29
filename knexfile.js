require("dotenv").config();
module.exports = {
  local: {
    client: "pg",
    connection: {
      host: process.env.DB_HOST,
      database: process.env.DB_DATABASE,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      charset: "utf8",
      pool: {
        min: 2,
        max: 10,
      },
    },
    migrations: {
      directory: __dirname + "/migrations",
    },
    seeds: {
      directory: __dirname + "/seeders",
    },
  },
  development: {
    client: "pg",
    connection: {
      host: process.env.DB_HOST_DEV,
      database: process.env.DB_DATABASE_DEV,
      user: process.env.DB_USER_DEV,
      password: process.env.DB_PASSWORD_DEV,
      charset: "utf8",
      pool: {
        min: 2,
        max: 10,
      },
      ssl: {
        rejectUnauthorized: false, 
      },
    },
    migrations: {
      directory: __dirname + "/migrations",
    },
    seeds: {
      directory: __dirname + "/seeders",
    },
  },
};
