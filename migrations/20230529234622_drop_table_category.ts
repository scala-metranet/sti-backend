import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.dropTable('news_category');
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('news_category');
}

