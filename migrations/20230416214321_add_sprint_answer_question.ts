import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('scoring', table => {
        table.string('sprint_id').nullable().references('id').inTable('sprint').after('score');
        table.string('internship_id').nullable().references('id').inTable('internship').after('score');
        table.string('squad_id').nullable().references('id').inTable('squad').after('score');
    });
  }
  
export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('scoring', table => {
    table.dropColumn('sprint_id');
    table.dropColumn('internship_id');
    table.dropColumn('squad_id');
  });
}
