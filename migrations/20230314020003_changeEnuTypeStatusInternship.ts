import { Knex } from "knex";
import { UserInternshipStatus } from "../src/dtos/users.dto";

const tableName = 'user_internship';

export async function up(knex: Knex): Promise<any> {
    let existRows;
    return knex.select()
    .from(tableName)
    .then((rows) => {
        existRows = rows
        return knex.schema.table(tableName, (table) => table.dropColumn('status'))
    })
    .then(() => knex.schema.table(tableName, (table) => table.enu('status', Object.values(UserInternshipStatus)).notNullable().defaultTo('unverified')))
    .then(() => {
        return Promise.all(existRows.map((row) => {
        return knex(tableName)
        .update({ status: row.status })
        .where('id', row.id)
        }))
    })
}


export async function down(knex: Knex): Promise<any> {
    let existRows;
    return knex.select()
    .from(tableName)
    .then((rows) => {
        existRows = rows
        return knex.schema.table(tableName, (table) => table.dropColumn('service'))
    })
    .then(() => knex.schema.table(tableName, (table) => table.enu('service', ['alpha', 'beta']).notNullable().defaultTo('alpha')))
    .then(() => {
        return Promise.all(existRows.map((row) => {
        return knex(tableName)
        .update({ service: row.service === 'gamma' ? 'alpha' : row.service })
        .where('id', row.id)
        }))
    })
}

