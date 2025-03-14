import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('internship_remapping', table => {
    table.string('id').notNullable().unique().primary();
    table.string('user_internship_id').references('id').inTable('user_internship');
    table.string('old_internship_id').references('id').inTable('internship');
    table.string('new_internship_id').references('id').inTable('internship');
    table.string('user_id').references('id').inTable('user');
    table.string('notes');
    table.timestamps(true, true);
    table.timestamp('deleted_at').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('internship_remapping');
}
