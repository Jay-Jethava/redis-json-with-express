const router = require("express").Router();
const blogController = require("./controller");
const { authenticate } = require("../../middleware/auth");

router
  .route("/:id")
  .patch(blogController.updateById)
  .delete(blogController.deleteById);

router
  .route("/")
  .post(authenticate, blogController.addBlog)
  .get(blogController.getAllBlogs);

module.exports = router;
