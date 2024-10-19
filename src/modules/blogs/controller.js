const blogService = require("./service");

exports.addBlog = async (req, res, next) => {
  try {
    req.body.UserId = req.requestor.id;
    const newBlog = await blogService.createBlog(req.body);

    res.status(200).json({
      status: "success",
      message: "blog created successfully.",
      data: {
        newBlog,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllBlogs = async (req, res, next) => {
  try {
    const blogs = await blogService.getBlogs(req.query);

    res.status(200).json({
      status: "success",
      data: {
        blogs,
      },
    });
  } catch (err) {
    console.error(err);
  }
};

exports.updateById = async (req, res, next) => {
  try {
    const [affected] = await blogService.updateBlog(req.body, {
      where: {
        id: req.params.id,
      },
      individualHooks: true,
    });

    res.status(200).json({
      status: "success",
      data: {
        affected,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteById = async (req, res, next) => {
  try {
    const affected = await blogService.deleteBlog({
      where: {
        id: req.params.id,
      },
    });

    res.status(200).json({
      status: "success",
      data: {
        affected,
      },
    });
  } catch (err) {
    next(err);
  }
};
