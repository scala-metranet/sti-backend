import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('sprint', table => {
    table.string('id').notNullable().unique().primary();
    table.string('mentor_id').notNullable().references('id').inTable('user').onDelete('cascade');
    table.string('sprint').notNullable();
    table.string('objective').notNullable();
    table.string('squad_leader_id').notNullable().references('id').inTable('user').onDelete('cascade');
    table.string('squad_id').notNullable().references('id').inTable('squad').onDelete('cascade');
    table.string('start_date').nullable();
    table.string('end_date').nullable();
    table.string('mentor_notes').nullable();
    table.string('mentor_lesson').nullable();
    table.timestamps(true, true);
    table.timestamp('deleted_at').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('sprint');
}
  

