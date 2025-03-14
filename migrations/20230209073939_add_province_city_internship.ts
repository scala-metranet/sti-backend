import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('internship', table => {
    table.string('province_id').nullable().references('id').inTable('province').onDelete('cascade');
    table.string('city_id').nullable().references('id').inTable('city').onDelete('cascade');
    table.integer('quota').defaultTo(0);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('internship', table => {
    table.dropColumn('province_id');
    table.dropColumn('city_id');
    table.dropColumn('quota');
  });
}