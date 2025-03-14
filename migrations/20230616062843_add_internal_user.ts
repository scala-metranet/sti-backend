import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('user', table => {
        table.boolean('internal').defaultTo(false).nullable();
    });
  }
  
export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('user', table => {
    table.dropColumn('internal');
  });
}
