const router = require("express").Router();
const Auth = require("../controller/Auth.controller");
const { requireAuth, requireCredentials } = require("../middleware/warehouseAuth");

router.post("/auth/login", requireCredentials, Auth.login);
router.post("/auth/logout", requireAuth, Auth.logout);
router.get("/auth/me", requireAuth, Auth.me);

module.exports = router;
