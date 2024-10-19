const { DataTypes } = require("sequelize");
const sequelize = require("../../utils/db"); // Import the database connection
const { validatePayload } = require("../../utils");
const blogJoiSchema = require("./joiSchema");
const User = require("../users/model");
const blogRedisService = require("./redisService");

const Blog = sequelize.define(
  "blog",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    body: {
      type: DataTypes.STRING(1000),
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
    },
    UserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    hooks: {
      beforeSave: (instance, options) => {
        // validate payload
        if (instance._options.isNewRecord)
          validatePayload(instance.dataValues, blogJoiSchema.create);
        else {
          const payload = {};
          options.fields.forEach((field) => {
            payload[field] = instance.get(field);
          });
          validatePayload(payload, blogJoiSchema.update);
        }
      },
      afterSave: (instance, options) => {
        //  -> set date in redis
        blogRedisService.setBlogsToRedis([instance.id]);
      },
      afterDestroy: (instance, options) => {
        console.log("afterDestroy", instance, options);
        //  -> set date in redis
        blogRedisService.removeBlogsFromRedis([instance.id]);
      },
    },
  }
);

User.hasMany(Blog, {
  foreignKey: "UserId",
});
Blog.belongsTo(User, {
  foreignKey: "UserId",
});

module.exports = Blog;
