import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('scoring_detail', table => {
        table.string('answer').nullable().after('score');
    });
  }
  
export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('scoring_detail', table => {
    table.dropColumn('answer');
  });
}
