import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('scoring', table => {
        table.float('activity_point').nullable();
        table.string('activity_description').nullable();
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable('scoring', table => {
        table.dropColumn('activity_point');
        table.dropColumn('activity_description');
    });
}

