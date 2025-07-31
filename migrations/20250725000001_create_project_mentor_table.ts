import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('project_mentor', table => {
        table.string('id').primary();
        table.string('project_id').notNullable();
        table.string('mentor_id').notNullable();
        table.timestamps(true, true);
        table.dateTime('deleted_at').nullable();

        // Foreign key constraints
        table.foreign('project_id').references('id').inTable('project');
        table.foreign('mentor_id').references('id').inTable('user');

        // Unique constraint to prevent duplicate assignments
        table.unique(['project_id', 'mentor_id']);
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('project_mentor');
}