const { Organization, OrganizationMember, User } = require("../../config/db");
const { Op } = require("sequelize");

// ── Create Organization ──
const createOrganization = async (userId, { name, address, logo_url }) => {
  if (!name) {
    const error = new Error("Organization name is required");
    error.status = 400;
    throw error;
  }

  const org = await Organization.create({
    name,
    address,
    logo_url,
    owner_id: userId,
  });

  // add creator as owner in members table
  await OrganizationMember.create({
    organization_id: org.id,
    user_id: userId,
    role: "owner",
  });

  return org;
};

// ── Get My Organizations ──
const getMyOrganizations = async (userId) => {
  const memberships = await OrganizationMember.findAll({
    where: { user_id: userId },
    include: [
      {
        model: Organization,
        as: "organization",
        include: [{ model: User, as: "owner", attributes: ["id", "name", "user_name", "avatar_url"] }],
      },
    ],
  });

  return memberships.map((m) => ({
    ...m.organization.toJSON(),
    my_role: m.role,
  }));
};

// ── Get Organization By ID ──
const getOrganizationById = async (userId, orgId) => {
  const membership = await OrganizationMember.findOne({
    where: { organization_id: orgId, user_id: userId },
  });

  if (!membership) {
    const error = new Error("Organization not found or access denied");
    error.status = 404;
    throw error;
  }

  const org = await Organization.findByPk(orgId, {
    include: [
      { model: User, as: "owner", attributes: ["id", "name", "user_name", "avatar_url"] },
    ],
  });

  return { ...org.toJSON(), my_role: membership.role };
};

// ── Update Organization ──
const updateOrganization = async (userId, orgId, { name, address, logo_url }) => {
  const membership = await OrganizationMember.findOne({
    where: { organization_id: orgId, user_id: userId },
  });

  if (!membership || !["owner", "admin"].includes(membership.role)) {
    const error = new Error("You don't have permission to update this organization");
    error.status = 403;
    throw error;
  }

  const org = await Organization.findByPk(orgId);
  if (!org) {
    const error = new Error("Organization not found");
    error.status = 404;
    throw error;
  }

  await org.update({
    ...(name && { name }),
    ...(address !== undefined && { address }),
    ...(logo_url !== undefined && { logo_url }),
  });

  return org;
};

// ── Delete Organization ──
const deleteOrganization = async (userId, orgId) => {
  const membership = await OrganizationMember.findOne({
    where: { organization_id: orgId, user_id: userId },
  });

  if (!membership || membership.role !== "owner") {
    const error = new Error("Only the owner can delete this organization");
    error.status = 403;
    throw error;
  }

  const org = await Organization.findByPk(orgId);
  if (!org) {
    const error = new Error("Organization not found");
    error.status = 404;
    throw error;
  }

  await org.destroy(); // soft delete
};

// ── Get Members ──
const getMembers = async (userId, orgId) => {
  const membership = await OrganizationMember.findOne({
    where: { organization_id: orgId, user_id: userId },
  });

  if (!membership) {
    const error = new Error("Organization not found or access denied");
    error.status = 404;
    throw error;
  }

  return await OrganizationMember.findAll({
    where: { organization_id: orgId },
    include: [
      { model: User, as: "user", attributes: ["id", "name", "user_name", "email", "avatar_url"] },
    ],
    order: [["joined_at", "ASC"]],
  });
};

// ── Update Member Role ──
const updateMemberRole = async (userId, orgId, targetUserId, role) => {
  const myMembership = await OrganizationMember.findOne({
    where: { organization_id: orgId, user_id: userId },
  });

  if (!myMembership || !["owner", "admin"].includes(myMembership.role)) {
    const error = new Error("You don't have permission to update member roles");
    error.status = 403;
    throw error;
  }

  // owner role can't be changed
  const targetMembership = await OrganizationMember.findOne({
    where: { organization_id: orgId, user_id: targetUserId },
  });

  if (!targetMembership) {
    const error = new Error("Member not found");
    error.status = 404;
    throw error;
  }

  if (targetMembership.role === "owner") {
    const error = new Error("Owner role cannot be changed");
    error.status = 403;
    throw error;
  }

  // admin can't assign admin role — only owner can
  if (role === "admin" && myMembership.role !== "owner") {
    const error = new Error("Only the owner can assign admin role");
    error.status = 403;
    throw error;
  }

  await targetMembership.update({ role });
  return targetMembership;
};

// ── Remove Member ──
const removeMember = async (userId, orgId, targetUserId) => {
  const myMembership = await OrganizationMember.findOne({
    where: { organization_id: orgId, user_id: userId },
  });

  if (!myMembership || !["owner", "admin"].includes(myMembership.role)) {
    const error = new Error("You don't have permission to remove members");
    error.status = 403;
    throw error;
  }

  const targetMembership = await OrganizationMember.findOne({
    where: { organization_id: orgId, user_id: targetUserId },
  });

  if (!targetMembership) {
    const error = new Error("Member not found");
    error.status = 404;
    throw error;
  }

  if (targetMembership.role === "owner") {
    const error = new Error("Owner cannot be removed");
    error.status = 403;
    throw error;
  }

  // admin can't remove another admin — only owner can
  if (targetMembership.role === "admin" && myMembership.role !== "owner") {
    const error = new Error("Only the owner can remove an admin");
    error.status = 403;
    throw error;
  }

  await targetMembership.destroy();
};

// ── Leave Organization ──
const leaveOrganization = async (userId, orgId) => {
  const membership = await OrganizationMember.findOne({
    where: { organization_id: orgId, user_id: userId },
  });

  if (!membership) {
    const error = new Error("You are not a member of this organization");
    error.status = 404;
    throw error;
  }

  if (membership.role === "owner") {
    const error = new Error("Owner cannot leave the organization. Transfer ownership or delete it.");
    error.status = 403;
    throw error;
  }

  await membership.destroy();
};

// ── Get Organization Stats ──
const getOrgStats = async (orgId) => {
  const { Board, Task } = require("../../config/db");

  const [members, boards] = await Promise.all([
    OrganizationMember.count({ where: { organization_id: orgId } }),
    Board.count({ where: { organization_id: orgId } }),
  ]);

  const boardIds = await Board.findAll({
    where: { organization_id: orgId },
    attributes: ["id"],
  });

  const tasks = boardIds.length > 0
    ? await Task.count({ where: { board_id: boardIds.map((b) => b.id) } })
    : 0;

  return { members, boards, tasks };
};

module.exports = {
  createOrganization,
  getMyOrganizations,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
  getMembers,
  updateMemberRole,
  removeMember,
  leaveOrganization,
  getOrgStats,
};