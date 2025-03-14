import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('scoring_question', table => {
        table.string('scoring_section_id').references('id').inTable('scoring_section');
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable('scoring_question', table => {
        table.dropColumn('scoring_section_id');
    });
}

