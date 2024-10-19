const router = require("express").Router();

router.use("/api/v1/users", require("../modules/users/index"));
router.use("/api/v1/blogs", require("../modules/blogs/index"));

module.exports = router;
