import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('internship', table => {
        table.text('description').alter();
        table.text('competence').alter();
        table.text('criteria').alter();
    });
  }
  
export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('campus', table => {
    table.dropColumn('pic');
    table.dropColumn('pic_position');
  });
}
