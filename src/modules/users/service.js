const User = require("./model");
const userRedisService = require("./redisService");

exports.findById = (id) => User.findByPk(id);

exports.findOne = (options) => User.findOne(options);

exports.getUsers = (query) => {
  //   -> add pagination
  const { page = 1, limit = 10 } = query;
  const offset = (page - 1) * limit;

  // -> filter by gender
  const filter = {};
  const { gender } = query;
  if (gender) filter.gender = gender;

  // -> implement other business logics if any

  return User.findAll({
    where: filter,
    limit,
    offset,
    order: [["name", "ASC"]],
  });
};

exports.createUser = (userData) => {
  // -> implement business logics if any
  return User.create(userData);
};

exports.updateUser = async (data, filter) => {
  const result = await User.update(data, filter);
  return result;
};

exports.deleteUser = async (options) => User.destroy(options);

// < define other services like update, delete, etc >
