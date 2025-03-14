import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('campus', table => {
        table.string('city_id').references('id').inTable('city');
        table.string('province_id').references('id').inTable('province');
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable('campus', table => {
        table.dropColumn('city_id');
        table.dropColumn('province_id');
    });
}

