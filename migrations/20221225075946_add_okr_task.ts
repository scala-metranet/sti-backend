import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('okr_task', table => {
    table.string('id').notNullable().unique().primary();
    table.string('title').notNullable();
    table.string('key_result').notNullable();
    table.string('mentee_id').notNullable().references('id').inTable('user').onDelete('cascade');
    table.float('progress').defaultTo(0);
    table.string('okr_id').notNullable().references('id').inTable('okr').onDelete('cascade');
    table.string('color').nullable();
    table.enu('status', ['Not Started', 'Progress', 'Finished']).notNullable();
    table.string('note').nullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('okr_task');
}
  

