import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('news', table => {
        table.boolean('is_highlight').defaultTo(false);
    });
  }
  
export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('news', table => {
    table.dropColumn('is_highlight');
  });
}
