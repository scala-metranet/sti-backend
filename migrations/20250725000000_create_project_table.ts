import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('project', table => {
        table.string('id').primary();
        table.string('name').notNullable();
        table.text('description').nullable();
        table.dateTime('start_date').nullable();
        table.dateTime('end_date').nullable();
        table.string('company_id').notNullable();
        table.timestamps(true, true);
        table.dateTime('deleted_at').nullable();

        // Foreign key constraints
        table.foreign('company_id').references('id').inTable('company');
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('project');
}