import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('internship', table => {
        table.boolean('is_publish').defaultTo(false);
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable('internship', table => {
        table.dropColumn('is_publish');
      });
}

