import { Knex } from "knex";
import { StatusJoinRequest } from "../src/dtos/users.dto";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('join_request', table => {
        table.string('id').notNullable().unique().primary();
        table.string('join_type').nullable();
        table.string('name').nullable();
        table.string('profession').nullable();
        table.string('institute').nullable();
        table.string('address').nullable();
        table.string('email').nullable();
        table.string('phone').nullable();
        table.string('purpose').nullable();
        table.string('info_source').nullable();
        table.enu('status',Object.values(StatusJoinRequest)).defaultTo('not_contacted').nullable();
        table.string('feedback').nullable();
        table.string('feedback_added').nullable();
        table.string('feedback_user_id').nullable();
        table.timestamps(true, true);
        table.timestamp('deleted_at').nullable();
    });
  }
  
export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('join_request');
}
