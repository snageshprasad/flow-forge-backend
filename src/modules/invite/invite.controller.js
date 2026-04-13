const inviteService = require("./invite.service");

const sendInvite = async (req, res) => {
  try {
    const result = await inviteService.sendInvite(
      req.user.id,
      req.params.orgId,
      req.body,
    );
    return res
      .status(201)
      .json({ message: "Invite sent successfully", data: result });
  } catch (error) {
    return res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

const acceptInvite = async (req, res) => {
  try {
    const result = await inviteService.acceptInvite(
      req.user.id,
      req.params.token,
    );
    return res.status(200).json({ message: "Invite accepted", data: result });
  } catch (error) {
    return res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

const declineInvite = async (req, res) => {
  try {
    await inviteService.declineInvite(req.user.id, req.params.token);
    return res.status(200).json({ message: "Invite declined" });
  } catch (error) {
    return res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

const getInviteByToken = async (req, res) => {
  try {
    const result = await inviteService.getInviteByToken(req.params.token);
    return res.status(200).json({ message: "Invite fetched", data: result });
  } catch (error) {
    return res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

const getMyInvites = async (req, res) => {
  try {
    const result = await inviteService.getMyInvites(req.user.id);
    return res.status(200).json({ message: "Invites fetched", data: result });
  } catch (error) {
    return res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

const cancelInvite = async (req, res) => {
  try {
    await inviteService.cancelInvite(req.user.id, req.params.inviteId);
    return res.status(200).json({ message: "Invite cancelled" });
  } catch (error) {
    return res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

const getOrgInvites = async (req, res) => {
  try {
    const result = await inviteService.getOrgInvites(
      req.user.id,
      req.params.orgId,
    );
    return res
      .status(200)
      .json({ message: "Org invites fetched", data: result });
  } catch (error) {
    return res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

module.exports = {
  sendInvite,
  acceptInvite,
  declineInvite,
  getInviteByToken,
  getMyInvites,
  cancelInvite,
  getOrgInvites,
};
