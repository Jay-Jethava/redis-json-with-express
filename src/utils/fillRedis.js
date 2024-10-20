const fillDataToRedis = () => {
  const blogRedisService = require("../modules/blogs/redisService");

  blogRedisService.setBlogsToRedis();
};

fillDataToRedis();
