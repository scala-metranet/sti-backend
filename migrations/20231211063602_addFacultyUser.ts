import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('user', table => {
        table.string('campus_faculty_id').nullable().references('id').inTable('campus_faculty');
        table.string('campus_major_id').nullable().references('id').inTable('campus_major');
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable('user', table => {
        table.dropColumn('campus_faculty_id');
        table.dropColumn('campus_major_id');
    });
}

