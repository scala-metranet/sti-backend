import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('schedule_session', table => {
    table.string('id').notNullable().unique().primary();
    table.string('schedule_id').nullable().references('id').inTable('schedule');
    table.string('time_start');
    table.string('time_end');
    table.string('zoom_link').nullable();
    table.timestamps(true, true);
    table.timestamp('deleted_at').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('schedule_session');
}
