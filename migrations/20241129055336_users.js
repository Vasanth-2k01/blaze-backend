/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable("users", function (table) {
      table.uuid("id").primary().defaultTo(knex.fn.uuid());
      table.string("first_name", 255).notNullable();
      table.string("last_name", 255).nullable();
      table.string("email", 255).nullable();
      table.string("mobile_number", 16).nullable();
      table.string("password", 255).notNullable();
      table
        .integer("status")
        .defaultTo(0)
        .nullable()
        .comment("1 - Active. 0 - Inactive");
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
      table.timestamp("deleted_at").nullable();
      table.uuid("created_by").nullable().defaultTo(null);
      table.uuid("updated_by").nullable().defaultTo(null);
      table.uuid("deleted_by").nullable().defaultTo(null);
    });
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = function (knex) {
    let query = knex.schema.dropTableIfExists("users");
    return knex.raw(`${query.toSQL()[0].sql} CASCADE;`);
  };
  