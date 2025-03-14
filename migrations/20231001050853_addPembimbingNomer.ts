import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('user', table => {
        table.string('pembimbing_phone').nullable();

    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable('user', table => {
        table.dropColumn('pembimbing_phone');
    });
}

