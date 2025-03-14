import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('user', table => {
        table.string('campus_master_id').nullable().references('id').inTable('campus_master');
    });
  }
  
export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('user', table => {
    table.dropColumn('campus_master_id');
  });
}
