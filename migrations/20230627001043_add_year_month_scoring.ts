import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('scoring', table => {
        table.string('month').nullable();
        table.string('year').nullable();
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable('scoring', table => {
        table.dropColumn('month');
        table.dropColumn('year');
      });
}

