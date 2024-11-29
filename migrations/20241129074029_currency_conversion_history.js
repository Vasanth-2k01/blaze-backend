/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable("currency_conversion_history", function (table) {
      table.uuid("id").primary().defaultTo(knex.fn.uuid());
      table.string("source_currency", 4).notNullable();
      table.string("target_currency", 4).notNullable();
      table.double("amount", 10, 3).notNullable();
      table.double("converted_amount", 10, 3).notNullable();
      table.string("conversion_time", 255).notNullable().defaultTo(knex.fn.now());;
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at")
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
    let query = knex.schema.dropTableIfExists("currency_conversion_history");
    return knex.raw(`${query.toSQL()[0].sql} CASCADE;`);
  };
  