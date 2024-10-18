const router = require("express").Router();
const userController = require("./controller");

router.post("/add-new-user", userController.addUser);
router.get("/user-list", userController.getAllUsers);
router.route("/:id").patch(userController.updateById);

module.exports = router;