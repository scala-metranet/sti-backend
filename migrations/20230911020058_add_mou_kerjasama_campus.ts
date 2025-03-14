import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('campus_program', table => {
        table.string('id').notNullable().unique().primary();
        table.string('campus_id').references('id').inTable('campus');
        table.string('program').nullable();
        table.string('mou').nullable();
        table.string('date_start').nullable();
        table.string('date_end').nullable();
        table.timestamps(true, true);
        table.timestamp('deleted_at').nullable();
    });
  }
  
export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('campus_program');
}
