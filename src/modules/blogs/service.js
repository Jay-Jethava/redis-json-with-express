const User = require("../users/model");
const Blog = require("./model");
const userRedisService = require("../users/redisService");

exports.getBlogs = (query) => {
  //   -> add pagination
  const { page = 1, limit = 10 } = query;
  const offset = (page - 1) * limit;

  return Blog.findAll({
    limit,
    offset,
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: User,
        attributes: ["id", "name", "email"],
      },
    ],
  });
};

exports.createBlog = (blogData) => {
  return Blog.create(blogData);
};

exports.updateBlog = async (data, filter) => {
  const result = await Blog.update(data, filter);
  return result;
};

exports.deleteBlog = (options) => Blog.destroy(options);

// < define other services like update, delete, etc >
