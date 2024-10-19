const router = require("express").Router();
const userController = require("./controller");
const { authenticate } = require("../../middleware/auth");

router.post("/login", userController.login);

router.route("/").post(userController.addUser).get(userController.getAllUsers);

router
  .route("/:id")
  .get(userController.getUserById)
  .patch(userController.updateById)
  .delete(userController.deleteUserById);

module.exports = router;
