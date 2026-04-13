const router = require("express").Router();
const organizationController = require("./organization.controller");
const { authenticate } = require("../../middleware/auth.middleware");

router.use(authenticate);

// ── Org CRUD ──
router.post("/", organizationController.createOrganization);
router.get("/", organizationController.getMyOrganizations);
router.get("/:id", organizationController.getOrganizationById);
router.put("/:id", organizationController.updateOrganization);
router.delete("/:id", organizationController.deleteOrganization);

// ── Stats ──
router.get("/:id/stats", organizationController.getOrgStats);

// ── Members ──
router.get("/:id/members", organizationController.getMembers);
router.put(
  "/:id/members/:userId/role",
  organizationController.updateMemberRole,
);
router.delete("/:id/members/:userId", organizationController.removeMember);
router.delete("/:id/leave", organizationController.leaveOrganization);

module.exports = router;
