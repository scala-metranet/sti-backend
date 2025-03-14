import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('scoring_question', table => {
        table.string('company_id').references('id').inTable('company');
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable('scoring_question', table => {
        table.dropColumn('company_id');
    });
}

