import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('company', table => {
        table.string('website').nullable();
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable('company', table => {
        table.dropColumn('website');
      });
}

