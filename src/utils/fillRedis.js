const blogRedisService = require("../modules/blogs/redisService");

const fillDataToRedis = () => {
  blogRedisService.setBlogsToRedis();
};

fillDataToRedis();
