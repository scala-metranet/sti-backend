import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('login_logs', table => {
        table.string('id').notNullable().unique().primary();
        table.string('user_id').nullable().references('id').inTable('user');
        table.string('ip').nullable();
        table.enum('status',['failed','success']).nullable();
        table.timestamps(true, true);
    });
  }
  
export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('login_logs');
}
