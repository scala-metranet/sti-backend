import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return addMigration()
  .then(addMigration1)
  .then(addMigration2)
  .then(addMigration3)
  .then(addMigration4)
  .then(addMigration5)
  .then(addMigration6)

  function addMigration() {
    return knex.schema.alterTable('internship', table => {
      table.timestamp('deleted_at').nullable();
    });
  }

  function addMigration1() {
    return knex.schema.alterTable('company', table => {
      table.timestamp('deleted_at').nullable();
    });
  }

  function addMigration2() {
    return knex.schema.alterTable('internship_program', table => {
      table.timestamp('deleted_at').nullable();
    });
  }

  function addMigration3() {
    return knex.schema.alterTable('okr', table => {
      table.timestamp('deleted_at').nullable();
    });
  }

  function addMigration4() {
    return knex.schema.alterTable('okr_task', table => {
      table.timestamp('deleted_at').nullable();
    });
  }

  function addMigration5() {
    return knex.schema.alterTable('squad', table => {
      table.timestamp('deleted_at').nullable();
    });
  }

  function addMigration6() {
    return knex.schema.alterTable('user', table => {
      table.timestamp('deleted_at').nullable();
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