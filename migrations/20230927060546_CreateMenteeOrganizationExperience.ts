import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('user_organization_experience', table => {
        table.string('id').notNullable().unique().primary();
        table.string('user_id').references('id').inTable('user');
        table.string('organization_name').nullable();
        table.string('position').nullable();
        table.string('level').nullable();
        table.string('date_start').nullable();
        table.string('date_end').nullable();
        table.text('notes').nullable();
        table.timestamps(true, true);
        table.timestamp('deleted_at').nullable();
    });
  }
  
export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('user_organization_experience');
}
