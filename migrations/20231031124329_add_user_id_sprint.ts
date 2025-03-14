import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('sprint', table => {
        table.string('user_id').references('id').inTable('user');
        table.string('squad_leader_id').nullable().alter();
        table.string('squad_id').nullable().alter();
        table.string('mentor_id').nullable().alter();
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable('sprint', table => {
        table.dropColumn('user_id');
    });
}

