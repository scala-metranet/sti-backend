import { config } from "dotenv";
config({ path: `.env.${process.env.NODE_ENV || "development"}` });

export const CREDENTIALS = process.env.CREDENTIALS === "true";
export const {
  NODE_ENV,
  PORT,
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_DATABASE,
  SECRET_KEY,
  LOG_FORMAT,
  ORIGIN,
  SUPABASE_HOST,
  SUPABASE_API_KEY,
  SUPABASE_BUCKET,
  MAILTRAP_HOST,
  MAILTRAP_USER,
  MAILTRAP_PASSWORD,
  REDIS_HOST,
  REDIS_PASSWORD,
  REDIS_PORT,
  CF_SITE_KEY,
  CF_SECRET_KEY
} = process.env;
export const BASE_PATH = "/api/v1";
