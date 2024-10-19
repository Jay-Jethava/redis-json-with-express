const { Op } = require("sequelize");
const redis = require("../../utils/Redis");
const { deleteKeysFromRedis } = require("../../utils/Redis");

class BlogRedisService {
  static index = "idx:blogs";
  static prefix = "blog:";
  static schema = {
    "$.id": {
      type: "NUMERIC",
      AS: "id",
      SORTABLE: true,
    },
    "$.title": {
      type: "TEXT",
      AS: "title",
    },
    "$.writer": {
      type: "TEXT",
      AS: "writer",
    },
    "$.body": {
      type: "TEXT",
      AS: "body",
    },
    "$.UserId": {
      type: "NUMERIC",
      AS: "UserId",
      SORTABLE: true,
    },
  };

  constructor() {
    redis.client.ft
      .create(`${BlogRedisService.index}`, BlogRedisService.schema, {
        ON: "JSON",
        PREFIX: BlogRedisService.prefix,
      })
      .then(() => {
        console.log(
          `RedisSearch index '${BlogRedisService.index}' created successfully`
        );
      })
      .catch((error) => {
        if (error.message === "Index already exists")
          console.error(
            `Redis index '${BlogRedisService.index}' already exists, skipped creation`
          );
        else
          console.error(
            "Error while creating RedisSearch index: ",
            BlogRedisService.index,
            error
          );
      });
  }

  formateData(instance) {
    return {
      id: instance.id,
      title: instance.title,
      body: instance.body,
      UserId: instance.UserId,
      writer: instance.user?.name,
      fullData: instance.toJSON(),
    };
  }

  async setBlogsToRedis(ids = undefined, filter = {}) {
    const Blog = require("../blogs/model");
    const User = require("../users/model");

    let offset = 0;
    let batchCount = 0;
    const BATCH_SIZE = ids?.length || 1000;

    while (true) {
      let blogs = await Blog.findAll({
        where: {
          ...(ids && {
            id: {
              [Op.in]: ids,
            },
          }),
          ...filter,
        },
        limit: BATCH_SIZE,
        offset: offset,
        order: [["id", "ASC"]],
        include: [
          {
            model: User,
            attributes: ["id", "name", "email"],
          },
        ],
      });

      if (blogs.length === 0) {
        break;
      }

      await Promise.all(
        blogs.map((blog) => {
          let data = this.formateData(blog);
          return redis.client.json
            .set(`${BlogRedisService.prefix}${blog.id}`, "$", data)
            .catch((err) =>
              console.error(`Error while setting blog ${blog.id} in Redis`, err)
            );
        })
      );

      offset += BATCH_SIZE;
      batchCount++;
      console.log(`setBlogsToRedis: Processed batch: ${batchCount}`);
    }

    console.log("✅ setBlogsToRedis finished");
  }

  async removeBlogsFromRedis(ids = undefined) {
    if (!ids) return;
    const keys = ids.map((id) => `${BlogRedisService.prefix}${id}`);

    redis.deleteKeysFromRedis(keys);
  }

  async updateBlogsOnUserUpdate(UserId) {
    this.setBlogsToRedis(undefined, {
      UserId,
    });
  }
}

module.exports = new BlogRedisService();
