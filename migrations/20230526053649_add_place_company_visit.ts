import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('company_visit', table => {
      table.string('place').nullable();
    });
  }
    
  export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable('company_visit', table => {
      table.dropColumn('place');
    });
  }

