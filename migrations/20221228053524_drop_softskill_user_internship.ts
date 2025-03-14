import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('user_internship', table => {
    table.dropColumn('soft_skill');
    table.dropColumn('hard_skill');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('user_internship', table => {
    table.specificType('soft_skill', 'varchar[]').notNullable();
    table.specificType('hard_skill', 'varchar[]').notNullable();
  });
}