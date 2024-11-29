const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const { ExtractJwt } = require("passport-jwt");
const JWTStrategy = require("passport-jwt").Strategy;
var knex = require("../DB");
const { comparePWD } = require("../utils/helpers");
require("dotenv").config();

passport.use(
  "local",
  new LocalStrategy(
    {
      usernameField: "email",
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      try {
        let userQuery = knex(process.env.USERS)
          .select("*")
          .where(`${process.env.USERS}.status`, 1)
          .where(`${process.env.USERS}.email`, email)
          .whereNull(`${process.env.USERS}.deleted_at`)
          .first();

        let userData = await userQuery;
        if (!userData) {
         return done(
            {
              status: 0,
              message: "Invalid credentials",
              data: {},
            },
            false
          );
        }
        if (!userData.status) {
          return done(
            {
              status: 0,
              message: "Your account is inactive.",
              data: {},
            },
            false
          );
        }

        let isUserPasswordCorrect = await comparePWD(
          password,
          userData.password
        );

        console.log(isUserPasswordCorrect, "isUserPasswordCorrect");
        
        if (!isUserPasswordCorrect) {
          return done(
            {
              status: 0,
              message: "Invalid credentials",
              data: {},
            },
            false

          );
        }

        return done(null, {
          data: userData,
          success: 1,
          message: "Login Successful",
        });
      } catch (e) {
        console.log(e,"ERROR");
        return done(
          {
            status: 0,
            message: e.message,
            data: {},
          },
          false
        );
      }
    }
  )
);

passport.use(
  "jwtProfile",
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJwt.fromHeader("authorization"),
      secretOrKey: process.env.JWT_SECRET,
      passReqToCallback: true,
    },
    async (req, payload, done) => {
      try {
        console.log(payload.sub, "payload.sub");
        let user_id = payload.sub;
        
        let userQuery = knex(process.env.USERS)
          .select('*')
          .where(`${process.env.USERS}.id`, user_id)
          .whereNull(`${process.env.USERS}.deleted_at`)
          .first();

        let userData = await userQuery;
        console.log(userData,"userData");
        
        if (!userData) {
          return done(
            {
              status: 0,
              message: "Invalid credentials",
              data: {},
            },
            false
          );
        }
        if (!userData.status) {
          return done(
            {
              status: 0,
              message: "Your account is inactive.",
              data: {},
            },
            false
          );
        }

        req.user = userData

        return done(null, userData);
      } catch (error) {
        console.log("JWT_SECRET", error, error.message);
        return done(
          {
            success: 0,
            message: error.message,
            data: {},
          },
          false
        );
      }
    }
  )
);