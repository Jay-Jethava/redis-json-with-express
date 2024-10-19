const { DataTypes } = require("sequelize");
const CryptoJS = require("crypto-js");
const createHttpError = require("http-errors");
const sequelize = require("../../utils/db"); // Import the database connection
const { validatePayload } = require("../../utils");
const userJoiSchema = require("./joiSchema");
const userRedisService = require("./redisService");
const blogRedisService = require("../blogs/redisService");

const User = sequelize.define(
  "user",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    gender: {
      type: DataTypes.ENUM(["Male", "Female", "Other"]),
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: "user",
      comment: "role can be - user, admin, writer",
    },
    createdAt: {
      type: DataTypes.DATE,
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    paranoid: true,
    hooks: {
      // Hook to hash the password before creating, save the user
      beforeSave: (instance, options) => {
        if (instance._changed.has("password"))
          instance.password = User.hashPassword(instance.password);

        // validate payload
        if (instance._options.isNewRecord)
          validatePayload(instance.dataValues, userJoiSchema.create);
        else {
          const payload = {};
          options.fields.forEach((field) => {
            payload[field] = instance.get(field);
          });
          validatePayload(payload, userJoiSchema.update);
        }
      },
      afterSave: (instance, options) => {
        //  -> set date in redis
        userRedisService.setUsersToRedis([instance.id]);

        if (!instance._options.isNewRecord) {
          blogRedisService.updateBlogsOnUserUpdate(instance.id);
        }
      },
      afterDestroy: (instance, options) => {
        //  -> set date in redis
        userRedisService.removeUsersFromRedis([instance.id]);
      },
    },
  }
);

// < ========== Static & Instance methods ========== >
User.hashPassword = function (password) {
  return CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
};

// User.verifyPassword = function (inputPassword, hashedPassword) {
//   const hashedInputPassword = CryptoJS.SHA256(inputPassword).toString(
//     CryptoJS.enc.Hex
//   );
//   return hashedInputPassword === hashedPassword;
// };
User.prototype.verifyPassword = function (inputPassword) {
  if (!this.password)
    throw createHttpError(500, "password is not selected on the user instance");

  const hashedInputPassword = CryptoJS.SHA256(inputPassword).toString(
    CryptoJS.enc.Hex
  );

  return hashedInputPassword === this.password;
};

User.prototype.getEmail = function () {
  return this.email.toLowerCase();
};

module.exports = User;
