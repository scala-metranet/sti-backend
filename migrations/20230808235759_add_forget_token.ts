import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('forget_token', table => {
        table.string('id').notNullable().unique().primary();
        table.string('email');
        table.string('token');
        table.datetime('valid_date');
        table.boolean('is_used').defaultTo(false);
        table.timestamps(true, true);
    });
  }
  
export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('forget_token');
}
