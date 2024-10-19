const createError = require("http-errors");
const jwt = require("jsonwebtoken");
const User = require("../modules/users/model");

exports.authenticate = async (req, res, next) => {
  try {
    console.log("authenticate is called");
    // -> decode the bearer token
    if (!req.headers.authorization)
      throw createError(401, "Unauthorized access");
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = await jwt.verify(token, process.env.JWT_SECRET);

    // -> fetch user from DB
    const user = await User.findByPk(decodedToken.id, {
      attributes: ["id", "name", "email"],
    });

    if (!user) throw createError(401, "Unauthorized access");

    // -> if roles passed, check the role of the user

    // -> mount the user to req
    req.requestor = user.toJSON();
    next();
  } catch (error) {
    next(error);
  }
};
