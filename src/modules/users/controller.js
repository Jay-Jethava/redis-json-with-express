const createError = require("http-errors");
const jwt = require("jsonwebtoken");
const userService = require("./service");
const Blog = require("../blogs/model");

exports.addUser = async (req, res, next) => {
  try {
    const userData = req.body;
    const newUser = await userService.createUser(userData);

    res.status(200).json({
      status: "success",
      message: "user created successfully.",
      data: {
        newUser,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.getUsers(req.query);

    res.status(200).json({
      status: "success",
      data: {
        users,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await userService.findOne({
      where: {
        id: req.params.id,
      },
      include: [
        {
          model: Blog,
        },
      ],
    });

    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.updateById = async (req, res, next) => {
  try {
    const affected = await userService.updateUser(req.body, {
      where: {
        id: req.params.id,
      },
      // returning: true, // PostgreSQL
      individualHooks: true,
    });

    res.status(200).json({
      status: "success",
      data: {
        affected,
      },
    });
  } catch (error) {
    next(err);
  }
};

exports.deleteUserById = async (req, res, next) => {
  try {
    const affected = await userService.deleteUser({
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

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await userService.findOne({
      where: {
        email,
      },
      attributes: ["id", "email", "password"],
    });

    if (!user || !user.verifyPassword(password))
      throw createError(401, "Invalid credentials");

    // -> Sign a JWT token
    const token = jwt.sign(
      {
        id: user.id,
      },
      process.env.JWT_SECRET
    );

    res.status(200).json({
      status: "success",
      message: "login successfully",
      token,
    });
  } catch (error) {
    next(error);
  }
};
