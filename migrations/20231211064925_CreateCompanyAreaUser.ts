import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('user', table => {
        table.string('company_area_id').nullable().references('id').inTable('company_area');
        table.string('company_unit_id').nullable().references('id').inTable('company_unit');
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable('user', table => {
        table.dropColumn('company_area_id');
        table.dropColumn('company_unit_id');
    });
}

