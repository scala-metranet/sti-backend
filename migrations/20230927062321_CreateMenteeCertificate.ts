import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('user_certificate', table => {
        table.string('id').notNullable().unique().primary();
        table.string('user_id').references('id').inTable('user');
        table.string('name').nullable();
        table.string('number').nullable();
        table.string('company').nullable();
        table.string('date_start').nullable();
        table.string('date_end').nullable();
        table.string('source').nullable();
        table.timestamps(true, true);
        table.timestamp('deleted_at').nullable();
    });
  }
  
export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('user_certificate');
}
