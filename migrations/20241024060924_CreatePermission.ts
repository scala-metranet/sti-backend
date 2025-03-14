import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('permission', table => {
        table.string('id').notNullable().unique().primary();
        table.string('role_id').nullable().references('id').inTable('role');
        table.string('user_id').nullable().references('id').inTable('user');
        table.specificType('permission', 'varchar[]').notNullable();
        table.timestamps(true, true);
        table.timestamp('deleted_at').nullable();
    });
  }
  
export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('permission');
}
