import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('scoring', table => {
        table.string('activity_link').nullable();
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable('scoring', table => {
        table.dropColumn('activity_link');
    });
}

