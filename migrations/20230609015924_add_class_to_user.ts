import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('user', table => {
        table.string('classes_id').nullable().references('id').inTable('classes');
        table.jsonb('other_field').nullable();
    });
  }
  
export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('user', table => {
    table.dropColumn('classes_id');
    table.jsonb('other_field').nullable();
  });
}
