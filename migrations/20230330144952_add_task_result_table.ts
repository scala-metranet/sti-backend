import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('okr_task_result', table => {
    table.string('id').notNullable().unique().primary();
    table.string('okr_task_id').nullable().references('id').inTable('okr_task');
    table.string('user_id').nullable().references('id').inTable('user');
    table.string('message');
    table.string('attachment').nullable();
    table.timestamps(true, true);
    table.timestamp('deleted_at').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('okr_task_result');
}
