const router = require("express").Router();
const userController = require("./user.controller");
const { authenticate } = require("../../middleware/auth.middleware");

router.use(authenticate);

router.get("/me", userController.getMe);
router.put("/me", userController.updateProfile);
router.put("/me/password", userController.changePassword);
router.get("/search", userController.searchUsers);
router.delete("/me", userController.deleteAccount);

module.exports = router;
