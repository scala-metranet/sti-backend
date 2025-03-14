import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('sprint', table => {
        table.string('user_internship_id').references('id').inTable('user_internship');
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable('sprint', table => {
        table.dropColumn('user_internship_id');
    });
}

