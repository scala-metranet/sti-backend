import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('graduation', table => {
        table.string('id').notNullable().unique().primary();
        table.string('user_internship_id').nullable().references('id').inTable('user_internship');
        table.string('linkedin_url').nullable();
        table.string('report_url').nullable();
        table.boolean('is_attend').defaultTo(false);
        table.string('reason').nullable();
        table.string('status').defaultTo('on_review').nullable();
        table.string('note').nullable();
        table.string('updated_by').nullable().references('id').inTable('user');
        table.timestamps(true, true);
        table.timestamp('deleted_at').nullable();
    });
  }
  
export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('graduation');
}
