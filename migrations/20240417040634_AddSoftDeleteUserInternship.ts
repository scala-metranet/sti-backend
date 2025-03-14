import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('user_internship', table => {
        table.timestamp('deleted_at').nullable();
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable('user_internship', table => {
        table.dropColumn('deleted_at');
    });
}

