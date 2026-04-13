const organizationService = require("./organization.service");

const createOrganization = async (req, res) => {
  try {
    const result = await organizationService.createOrganization(
      req.user.id,
      req.body,
    );
    return res
      .status(201)
      .json({ message: "Organization created", data: result });
  } catch (error) {
    return res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

const getMyOrganizations = async (req, res) => {
  try {
    const result = await organizationService.getMyOrganizations(req.user.id);
    return res
      .status(200)
      .json({ message: "Organizations fetched", data: result });
  } catch (error) {
    return res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

const getOrganizationById = async (req, res) => {
  try {
    const result = await organizationService.getOrganizationById(
      req.user.id,
      req.params.id,
    );
    return res
      .status(200)
      .json({ message: "Organization fetched", data: result });
  } catch (error) {
    return res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

const updateOrganization = async (req, res) => {
  try {
    const result = await organizationService.updateOrganization(
      req.user.id,
      req.params.id,
      req.body,
    );
    return res
      .status(200)
      .json({ message: "Organization updated", data: result });
  } catch (error) {
    return res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

const deleteOrganization = async (req, res) => {
  try {
    await organizationService.deleteOrganization(req.user.id, req.params.id);
    return res.status(200).json({ message: "Organization deleted" });
  } catch (error) {
    return res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

const getMembers = async (req, res) => {
  try {
    const result = await organizationService.getMembers(
      req.user.id,
      req.params.id,
    );
    return res.status(200).json({ message: "Members fetched", data: result });
  } catch (error) {
    return res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

const updateMemberRole = async (req, res) => {
  try {
    const result = await organizationService.updateMemberRole(
      req.user.id,
      req.params.id,
      req.params.userId,
      req.body.role,
    );
    return res
      .status(200)
      .json({ message: "Member role updated", data: result });
  } catch (error) {
    return res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

const removeMember = async (req, res) => {
  try {
    await organizationService.removeMember(
      req.user.id,
      req.params.id,
      req.params.userId,
    );
    return res.status(200).json({ message: "Member removed" });
  } catch (error) {
    return res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

const leaveOrganization = async (req, res) => {
  try {
    await organizationService.leaveOrganization(req.user.id, req.params.id);
    return res.status(200).json({ message: "Left organization" });
  } catch (error) {
    return res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

const getOrgStats = async (req, res) => {
  try {
    const result = await organizationService.getOrgStats(
      req.user.id,
      req.params.id,
    );
    return res.status(200).json({ message: "Stats fetched", data: result });
  } catch (error) {
    return res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
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
