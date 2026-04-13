const router = require("express").Router();
const inviteController = require("./invite.controller");
const { authenticate } = require("../../middleware/auth.middleware");

// ── Public — token preview (no auth needed, shows invite details) ──
router.get("/token/:token", inviteController.getInviteByToken);

// ── Protected ──
router.use(authenticate);

router.get("/me", inviteController.getMyInvites);
router.post("/accept/:token", inviteController.acceptInvite);
router.post("/decline/:token", inviteController.declineInvite);

// ── Org-scoped ──
router.post("/org/:orgId", inviteController.sendInvite);
router.get("/org/:orgId", inviteController.getOrgInvites);
router.delete("/:inviteId", inviteController.cancelInvite);

module.exports = router;
