import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('user', table => {
    table.specificType('soft_skill', 'varchar[]').nullable();
    table.specificType('hard_skill', 'varchar[]').nullable();
    table.string('mother_name').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('user', table => {
    table.dropColumn('soft_skill');
    table.dropColumn('hard_skill');
    table.dropColumn('mother_name');
  });
}