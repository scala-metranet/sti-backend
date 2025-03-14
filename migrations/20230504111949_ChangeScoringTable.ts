import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('scoring', table => {
      table.dropColumn('user_internship_id');
      table.dropColumn('mentor_id');
      table.string('user_id').nullable().references('id').inTable('user');
      table.string('created_by').nullable().references('id').inTable('user');
    });
  }
  
export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('scoring_detail', table => {
    table.string('user_internship_id').nullable().references('id').inTable('user_internship_id');
    table.string('mentor_id').nullable().references('id').inTable('user');
    table.dropColumn('user_id')
    table.dropColumn('created_by')
  });
}
