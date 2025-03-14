import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return addMigration()
  .then(addMigration1)
  .then(addMigration2)
  .then(addMigration3)

  function addMigration() {
    return knex.schema.alterTable('okr', table => {
      table.dropColumn('objective');
      table.dropColumn('sprint');
      table.dropColumn('note');
      table.dropColumn('squad_id');
      table.dropColumn('start_date');
      table.dropColumn('end_date');

      table.string('sprint_id').after('id').notNullable().references('id').inTable('sprint').onDelete('cascade');
      table.string('output').after('id').notNullable();
      table.string('key_result').after('id').notNullable();
      table.string('due_date').after('id').notNullable();
    });
  }

  function addMigration1() {
    return knex.schema.alterTable('okr_task', table => {
        table.dropColumn('key_result');
        table.dropColumn('progress');
        table.dropColumn('color');
        table.dropColumn('note');

        table.string('sprint_id').after('title').notNullable().references('id').inTable('sprint').onDelete('cascade');
        table.string('result').after('title').notNullable();
        table.string('due_date').after('title').notNullable();
      });
  }

  function addMigration2() {
    return knex.schema.createTable('okr_mentee', table => {
        table.string('id').notNullable().unique().primary();
        table.string('okr_id').notNullable().references('id').inTable('okr').onDelete('cascade');
        table.string('mentee_id').notNullable().references('id').inTable('user').onDelete('cascade');
        table.timestamps(true, true);
      });
  }

  function addMigration3() {
    return knex.schema.createTable('okr_task_mentee', table => {
        table.string('id').notNullable().unique().primary();
        table.string('okr_task_id').notNullable().references('id').inTable('okr_task').onDelete('cascade');
        table.string('mentee_id').notNullable().references('id').inTable('user').onDelete('cascade');
        table.timestamps(true, true);
      });
  }
}

export async function down(knex: Knex): Promise<void> {
  knex.schema.alterTable('internship', table => {
    table.dropColumn('deleted_at');
  });

  knex.schema.alterTable('company', table => {
    table.dropColumn('deleted_at');
  });

  knex.schema.alterTable('internship_program', table => {
    table.dropColumn('deleted_at');
  });

  knex.schema.alterTable('okr', table => {
    table.dropColumn('deleted_at');
  });

  knex.schema.alterTable('okr_task', table => {
    table.dropColumn('deleted_at');
  });

  knex.schema.alterTable('squad', table => {
    table.dropColumn('deleted_at');
  });

  knex.schema.alterTable('user', table => {
    table.dropColumn('deleted_at');
  });
}