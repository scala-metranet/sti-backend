import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('speaker', table => {
        table.string('id').notNullable().unique().primary();
        table.string('user_id').references('id').inTable('user');
        table.string('expertise').nullable();
        table.string('experience').nullable();
        table.text('reason').nullable();
        table.timestamps(true, true);
        table.timestamp('deleted_at').nullable();
    });
  }
  
export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('speaker');
}
