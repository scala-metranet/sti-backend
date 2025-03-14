import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('attendance', table => {
        table.integer('score').defaultTo(0);
        table.boolean('isScored').defaultTo(false);
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable('attendance', table => {
        table.dropColumn('score');
        table.dropColumn('isScored');
    });
}

