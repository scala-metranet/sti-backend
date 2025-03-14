import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('okr', table => {
    table.string('id').notNullable().unique().primary();
    table.string('objective').notNullable();
    table.string('sprint').notNullable();
    table.string('mentor_id').notNullable().references('id').inTable('user').onDelete('cascade');
    table.datetime('start_date').notNullable();
    table.datetime('end_date').notNullable();
    table.string('note').nullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('okr');
}
  

