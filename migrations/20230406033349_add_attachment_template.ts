import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('attachment_template', table => {
    table.string('id').notNullable().unique().primary();
    table.string('user_id').nullable().references('id').inTable('user');
    table.string('name');
    table.string('value').nullable();
    table.timestamps(true, true);
    table.timestamp('deleted_at').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('attachment_template');
}
