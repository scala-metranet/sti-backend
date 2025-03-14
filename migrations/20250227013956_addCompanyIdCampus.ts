import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('campus', table => {
        table.string('company_id').nullable();
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable('campus', table => {
        table.dropColumn('company_id');
    });
}

