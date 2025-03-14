import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('company_unit', table => {
        table.string('id').notNullable().unique().primary();
        table.string('company_area_id').references('id').inTable('company_area');
        table.string('company_id').references('id').inTable('company');
        table.string('name').nullable();
        table.string('description').nullable();
        table.timestamps(true, true);
        table.timestamp('deleted_at').nullable();
    });
  }
  
export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('company_unit');
}
