const { Op } = require("sequelize");
const User = require("../users/model");
const Blog = require("./model");
const blogRedisService = require("../blogs/redisService");

exports.getBlogs = async (query) => {
  //   -> add pagination
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "DESC",
    search,
  } = query;

  let data;
  const offset = (page - 1) * limit;

  data = await blogRedisService.getAllBlogs({
    offset,
    limit,
    sortBy,
    sortOrder,
    search,
  });

  // data = null;

  if (!data)
    data = await Blog.findAll({
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          attributes: ["id", "name", "email"],
        },
      ],
      where: {
        [Op.or]: [
          {
            title: {
              [Op.like]: `%${search}%`,
            },
          },
          {
            "$user.name$": {
              [Op.like]: `%${search}%`,
            },
          },
        ],
      },
    });

  return data;
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
