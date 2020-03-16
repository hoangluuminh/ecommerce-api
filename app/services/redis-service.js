const redis = require("async-redis");
const redisConfig = require("../config/redis.config");

exports.redisClientInit = () => {
  return redis.createClient({
    host: redisConfig.HOST,
    port: redisConfig.PORT,
    password: redisConfig.PASSWORD
  });
};
