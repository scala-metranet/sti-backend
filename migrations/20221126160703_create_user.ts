import { Knex } from 'knex';
import { UserStatus, UserGender, UserProvider } from '../src/dtos/users.dto';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('user', table => {
    table.string('id').notNullable().unique().primary();
    table.string('email').notNullable().unique();
    table.string('name').notNullable();
    table.string('password').notNullable();
    table.string('role_id').notNullable().references('id').inTable('role').onDelete('cascade');
    table.enu('provider', Object.values(UserProvider)).defaultTo('email');
    table.enu('status', Object.values(UserStatus)).after('platform').defaultTo('unverified');
    table.string('status_note');
    table.string('place_of_birth');
    table.date('date_of_birth');
    table.string('no_hp');
    table.enu('gender', Object.values(UserGender)).after('status');
    table.string('photo').nullable();
    table.string('degree').nullable();
    table.string('school').nullable();
    table.integer('semester').nullable();
    table.string('instagram').nullable();
    table.string('linkedin').nullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('user');
}
