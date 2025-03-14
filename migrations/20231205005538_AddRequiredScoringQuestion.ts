import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('scoring_question', table => {
        table.boolean('is_required').defaultTo(true);
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable('scoring_question', table => {
        table.dropColumn('is_required');
    });
}

