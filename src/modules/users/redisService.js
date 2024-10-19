const { Op } = require("sequelize");
const redis = require("../../utils/Redis");
const { deleteKeysFromRedis } = require("../../utils/Redis");

class UserRedisService {
  static index = "idx:users";
  static prefix = "user:";
  static schema = {
    "$.id": {
      type: "NUMERIC",
      AS: "id",
      SORTABLE: true,
    },
    "$.name": {
      type: "TEXT",
      AS: "name",
    },
    "$.email": {
      type: "TEXT",
      AS: "email",
    },
    "$.email": {
      type: "TEXT",
      AS: "email",
    },
  };

  constructor() {
    redis.client.ft
      .create(`${UserRedisService.index}`, UserRedisService.schema, {
        ON: "JSON",
        PREFIX: UserRedisService.prefix,
      })
      .then(() => {
        console.log(
          `RedisSearch index '${UserRedisService.index}' created successfully`
        );
      })
      .catch((error) => {
        if (error.message === "Index already exists")
          console.error(
            `Redis index '${UserRedisService.index}' already exists, skipped creation`
          );
        else
          console.error(
            "Error while creating RedisSearch index: ",
            UserRedisService.index,
            error
          );
      });
  }

  formateData(instance) {
    return {
      id: instance.id,
      name: instance.name,
      fullData: instance,
    };
  }

  async setUsersToRedis(ids = undefined) {
    const User = require("./model");

    let offset = 0;
    let batchCount = 0;
    const BATCH_SIZE = 1000;

    while (true) {
      let users = await User.findAll({
        where: {
          ...(ids && {
            id: {
              [Op.in]: ids,
            },
          }),
        },
        limit: BATCH_SIZE,
        offset: offset,
        order: [["id", "ASC"]],
      });

      if (users.length === 0) {
        break;
      }

      await Promise.all(
        users.map((user) => {
          let data = this.formateData(user);
          return redis.client.json
            .set(`${UserRedisService.prefix}${user.id}`, "$", data)
            .catch((err) =>
              console.error(`Error while setting user ${user.id} in Redis`, err)
            );
        })
      );

      offset += BATCH_SIZE;
      batchCount++;
      console.log(`setUsersToRedis: Processed batch: ${batchCount}`);
    }

    console.log("✅ setUsersToRedis finished");
  }

  async removeUsersFromRedis(ids = undefined) {
    if (!ids) return;
    const keys = ids.map((id) => `${UserRedisService.prefix}${id}`);

    redis.deleteKeysFromRedis(keys);
  }
}

module.exports = new UserRedisService();
