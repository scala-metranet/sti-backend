import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('join_request', table => {
    table.dropColumn('info_source');
    // table.specificType('info_source', 'varchar[]').nullable();
  });
}
  
export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('join_request', table => {
    table.dropColumn('info_source');
  });
}
