import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('campus_major', table => {
        table.string('id').notNullable().unique().primary();
        table.string('campus_faculty_id').references('id').inTable('campus_faculty');
        table.string('campus_id').references('id').inTable('campus');
        table.string('name').nullable();
        table.string('level').nullable();
        table.timestamps(true, true);
        table.timestamp('deleted_at').nullable();
    });
  }
  
export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('campus_major');
}
