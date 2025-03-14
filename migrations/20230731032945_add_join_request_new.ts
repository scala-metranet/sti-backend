import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('join_request', table => {
        table.string('campus_id').nullable().references('id').inTable('campus');
        table.string('institute_type').nullable();
        table.string('faculty').nullable();
        table.string('major').nullable();
        table.string('concept').nullable();
        table.string('topic').nullable();
        table.string('total_participant').nullable();
        table.string('expected_date').nullable();
        table.string('proposal').nullable();
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable('join_request', table => {
        table.dropColumn('campus_id');
        table.dropColumn('institute_type');
        table.dropColumn('faculty');
        table.dropColumn('major');
        table.dropColumn('concept');
        table.dropColumn('topic');
        table.dropColumn('total_participant');
        table.dropColumn('expected_date');
        table.dropColumn('proposal');
      });
}

