import { REDIS_HOST, REDIS_PASSWORD, REDIS_PORT } from "@/config";
import { createClient } from "redis";
import type { RedisClientType } from "redis";

export const redisClient: RedisClientType = createClient({
  password: REDIS_PASSWORD,
  socket: {
    host: REDIS_HOST,
    port: Number(REDIS_PORT),
  },
});
