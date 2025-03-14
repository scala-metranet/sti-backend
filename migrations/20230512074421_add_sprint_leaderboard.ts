import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('leaderboard', table => {
    table.string('sprint_id').nullable().references('id').inTable('sprint');
    table.string('internship_id').nullable().references('id').inTable('internship');
    table.string('user_id').nullable().references('id').inTable('user');
  });
}
  
export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('leaderboard', table => {
    table.dropColumn('sprint_id');
    table.dropColumn('internship_id');
    table.dropColumn('user_id');
  });
}
