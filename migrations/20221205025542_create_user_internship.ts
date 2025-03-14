import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('user_internship', table => {
    table.string('id').notNullable().unique().primary();
    table.string('mentee_id').notNullable().references('id').inTable('user').onDelete('cascade');
    table.string('internship_id').notNullable().references('id').inTable('internship').onDelete('cascade');
    table.specificType('soft_skill', 'varchar[]').notNullable();
    table.specificType('hard_skill', 'varchar[]').notNullable();
    table.string('strength').notNullable();
    table.string('weakness').notNullable();
    table.string('review').notNullable();
    table.string('information_source').notNullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('user_internship');
}
