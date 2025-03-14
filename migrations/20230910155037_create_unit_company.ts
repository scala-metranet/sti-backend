import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('company_area', table => {
        table.string('id').notNullable().unique().primary();
        table.string('company_id').references('id').inTable('company');
        table.string('name').nullable();
        table.string('address').nullable();
        table.string('province_id').nullable().references('id').inTable('province').onDelete('cascade');
        table.string('city_id').nullable().references('id').inTable('city').onDelete('cascade');
        table.timestamps(true, true);
        table.timestamp('deleted_at').nullable();
    });
  }
  
export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('company_area');
}
