import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('scoring_detail', table => {
    table.string('id').notNullable().unique().primary();
    table.string('scoring_id').references('id').inTable('scoring');
    table.string('scoring_question_id').references('id').inTable('scoring_question');
    table.integer('score');
    table.timestamps(true, true);
    table.timestamp('deleted_at').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('scoring_detail');
}
