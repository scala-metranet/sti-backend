import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('internship', table => {
    table.string('id').notNullable().unique().primary();
    table.string('name').notNullable();
    table.string('mentor_id').notNullable().references('id').inTable('user').onDelete('cascade');
    table.string('description').notNullable();
    table.string('company_id').notNullable().references('id').inTable('company').onDelete('cascade');
    table.string('program_id').notNullable().references('id').inTable('internship_program').onDelete('cascade');
    table.datetime('period_start').notNullable();
    table.datetime('period_end').notNullable();
    table.enu('type', ['WFO', 'WFH', 'Hybrid']).notNullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('internship');
}
