const redis = require("async-redis");
const redisConfig = require("../configs/redis.config");

exports.redisClientInit = () => {
  return redis.createClient({
    host: redisConfig.HOST,
    port: redisConfig.PORT,
    password: redisConfig.PASSWORD
  });
};
