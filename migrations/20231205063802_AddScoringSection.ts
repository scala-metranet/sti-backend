import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('scoring_section', table => {
        table.string('id').notNullable().unique().primary();
        table.string('name').nullable();
        table.string('scoring_master_id').nullable().references('id').inTable('scoring_master');
        table.timestamps(true, true);
        table.timestamp('deleted_at').nullable();
    });
  }
  
export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('scoring_section');
}
