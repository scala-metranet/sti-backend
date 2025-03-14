import Knex from "knex";
//import dbConfig from '../../knexfile';
//import knexDb = require('../../knexfile');
import { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_DATABASE } from "../config/index";

const dbConfig = {
  //connection: 'postgresql://db.wzfpcrojwbjuhexarobj.supabase.co:5432/postgres',
  development: {
    client: "pg",
    connection: {
      host: DB_HOST,
      database: DB_DATABASE,
      user: DB_USER,
      password: DB_PASSWORD,
      port: DB_PORT,
    },
  },
  migrations: {
    directory: "src/databases/migrations",
    tableName: "migrations",
    // stub: 'src/databases/stubs',
  },
  seeds: {
    directory: "src/databases/seeds",
    // stub: 'src/databases/stubs',
  },
};

//export default Knex(dbConfig.development);
export default Knex(dbConfig.development);
