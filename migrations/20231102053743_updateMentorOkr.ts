import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('okr', table => {
        table.string('mentor_id').nullable().alter();
        table.string('user_id').references('id').inTable('user');
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable('okr', table => {
        table.dropColumn('user_id');
    });
}

