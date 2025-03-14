import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('company', table => {
    table.string('id').notNullable().unique().primary();
    table.string('name').notNullable();
    table.string('cfu').notNullable();
    table.string('department').notNullable();
    table.string('unit').notNullable();
    table.string('description').notNullable();
    table.string('logo').notNullable();
    table.string('type').notNullable();
    table.string('address').notNullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('company');
}
