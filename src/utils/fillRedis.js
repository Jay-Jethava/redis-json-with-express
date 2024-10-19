const userRedisService = require("../modules/users/redisService");

const fillDataToRedis = () => {
  userRedisService.setAllUsersToRedis();
};

fillDataToRedis();
