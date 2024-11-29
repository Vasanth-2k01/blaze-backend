const knex = require("../DB");
const { encryptPWD } = require("../utils/helpers");
const _ = require("lodash");
const { CustomError } = require("../utils/index.js");
require("dotenv").config();

exports.seed = async function () {
  let rows = [
    {
      first_name: "Super",
      last_name: "Admin",
      email: "superadmin@yopmail.com",
      mobile_number: "9876543215",
      password: await encryptPWD("Qwer@123"),
      status: 1,
    },
  ];

  try {
    for (let index = 0; index < rows.length; index++) {
      console.log(rows[index],"rows[index]");
      
      let query1 = knex(process.env.USERS)
        .where("first_name", rows[index].first_name)
        .andWhere("last_name", rows[index].last_name)
        .andWhere("email", rows[index].email)
        .andWhere("mobile_number", rows[index].mobile_number);
      let results = await query1;
      if (results.length) {
        console.log(`Data already exist in ${process.env.USERS} table`);
      } else {
        let result = await knex(process.env.USERS)
          .insert({
            id: rows[index].id,
            first_name: rows[index].first_name,
            last_name: rows[index].last_name,
            email: rows[index].email,
            mobile_number: rows[index].mobile_number,
            password: rows[index].password,
            status: rows[index].status,
          })
          .returning("id");

        console.log(`Data inserted in ${process.env.USERS} table`);
      }
    }
  } catch (error) {
    console.log(error);
    throw new CustomError(error, 500, {});
  }
};
