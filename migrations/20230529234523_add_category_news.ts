import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('news', table => {
        table.string('category').nullable();
    });
  }
  
export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('news', table => {
    table.dropColumn('category');
  });
}
