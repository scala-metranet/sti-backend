import { HttpException } from "@/exceptions/HttpException";
import { redisClient } from "@/utils/redis";
import rateLimit from "express-rate-limit";
import moment from "moment";

export const rateLimiterUsingThirdParty = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 minutes
  max: 5, // Limit each IP to 5 create account requests per `window` (here, per hour)
  message: "Kamu sudah gagal login 5 kali, silahkan coba lagi setelah 60 menit",
  standardHeaders: false,
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

redisClient.on("error", err => console.log("Redis Client Error", err));

const WINDOW_SIZE_IN_HOURS = 1;
const MAX_WINDOW_REQUEST_COUNT = 5;
const WINDOW_LOG_INTERVAL_IN_HOURS = 1;

export const customRedisRateLimiter = async (req, _res, next) => {
  try {
    if (!redisClient.isReady) {
      await redisClient.connect();
    }
    // check that redis client exists
    if (!redisClient) {
      throw new Error("Redis client does not exist!");
      // process.exit(1);
    }
    // fetch records of current user using IP address, returns null when no record is found
    const record = await redisClient.get(req.ip);
    const currentRequestTime = moment();

    //  if no record is found , create a new record for user and store to redis
    if (record == null) {
      const newRecord = [];
      const requestLog = {
        requestTimeStamp: currentRequestTime.unix(),
        requestCount: 1,
      };
      newRecord.push(requestLog);

      await redisClient.set(req.ip, JSON.stringify(newRecord));
      next();
    } else {
      // if record is found, parse it's value and calculate number of requests users has made within the last window
      const data = JSON.parse(record);
      const windowStartTimestamp = moment().subtract(WINDOW_SIZE_IN_HOURS, "hours").unix();
      const requestsWithinWindow = data.filter(entry => {
        return entry.requestTimeStamp > windowStartTimestamp;
      });

      const totalWindowRequestsCount = requestsWithinWindow.reduce((accumulator, entry) => {
        return accumulator + entry.requestCount;
      }, 0);
      // if number of requests made is greater than or equal to the desired maximum, return error
      if (totalWindowRequestsCount >= MAX_WINDOW_REQUEST_COUNT) {
        next(
          new HttpException(
            429,
            `Kamu telah gagal login sebanyak ${MAX_WINDOW_REQUEST_COUNT} kali, silahkan coba lagi ${WINDOW_SIZE_IN_HOURS} jam kemudian atau hubungi admin`,
          ),
        );
      } else {
        // if number of requests made is less than allowed maximum, log new entry
        const lastRequestLog = data[data.length - 1];
        const potentialCurrentWindowIntervalStartTimeStamp = currentRequestTime.subtract(WINDOW_LOG_INTERVAL_IN_HOURS, "hours").unix();
        //  if interval has not passed since last request log, increment counter
        if (lastRequestLog.requestTimeStamp > potentialCurrentWindowIntervalStartTimeStamp) {
          lastRequestLog.requestCount++;
          data[data.length - 1] = lastRequestLog;
        } else {
          //  if interval has passed, log new entry for current user and timestamp
          data.push({
            requestTimeStamp: currentRequestTime.unix(),
            requestCount: 1,
          });
        }

        await redisClient.set(req.ip, JSON.stringify(data));
        next();
      }
    }
  } catch (error) {
    next(error);
  }
};
