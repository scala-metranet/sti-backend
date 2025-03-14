import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('campus', table => {
        table.boolean('is_open').defaultTo(true);

    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable('campus', table => {
        table.dropColumn('is_open');
    });
}

