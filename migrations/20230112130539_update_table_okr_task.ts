import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('okr_task', table => {
    table.integer('acc_mentor').defaultTo(0);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('okr_task', table => {
    table.dropColumn('acc_mentor');
  });
}