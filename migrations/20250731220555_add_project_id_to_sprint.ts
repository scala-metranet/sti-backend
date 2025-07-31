import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('sprint', table => {
    table.string('project_id').nullable().references('id').inTable('project').onDelete('cascade');
  });
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('sprint', table => {
    table.dropColumn('project_id');
  });
}

