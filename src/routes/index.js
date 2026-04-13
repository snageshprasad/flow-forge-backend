const router = require("express").Router()

router.use("/auth", require("../modules/auth/auth.routes"));
router.use("/users", require("../modules/user/user.routes"));
router.use("/organizations", require("../modules/organizations/organization.routes"));
router.use("/invites", require("../modules/invite/invite.routes"));

module.exports = router