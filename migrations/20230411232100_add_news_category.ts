import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('news', table => {
    table.string('id').notNullable().unique().primary();
    table.string('user_id').references('id').inTable('user');
    table.string('category_id').references('id').inTable('news_category');
    table.string('banner').nullable();
    table.string('title');
    table.string('slug').nullable();
    table.text('content');
    table.timestamps(true, true);
    table.timestamp('deleted_at').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('news');
}
