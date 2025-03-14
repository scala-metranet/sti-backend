import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('campus_master', table => {
        table.string('id').notNullable().unique().primary();
        table.string('name');
        table.timestamps(true, true);
        table.timestamp('deleted_at').nullable();
    });
  }
  
export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('campus_master');
}
