const userService = require("./user.service");

const getMe = async (req, res) => {
  try {
    const result = await userService.getMe(req.user.id);
    return res.status(200).json({ message: "User fetched", data: result });
  } catch (error) {
    return res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const result = await userService.updateProfile(req.user.id, req.body);
    return res.status(200).json({ message: "Profile updated", data: result });
  } catch (error) {
    return res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

const changePassword = async (req, res) => {
  try {
    const result = await userService.changePassword(req.user.id, req.body);
    return res.status(200).json(result);
  } catch (error) {
    return res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

const searchUsers = async (req, res) => {
  try {
    const result = await userService.searchUsers(req.query.q);
    return res.status(200).json({ message: "Users fetched", data: result });
  } catch (error) {
    return res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

const deleteAccount = async (req, res) => {
  try {
    await userService.deleteAccount(req.user.id);
    return res.status(200).json({ message: "Account deleted" });
  } catch (error) {
    return res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

module.exports = {
  getMe,
  updateProfile,
  changePassword,
  searchUsers,
  deleteAccount,
};
