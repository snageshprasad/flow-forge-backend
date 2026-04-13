const bcrypt = require("bcrypt");
const { User } = require("../../config/db");
const { Op } = require("sequelize");

const getMe = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ["password"] },
  });
  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }
  return user;
};

const updateProfile = async (userId, { name, user_name }) => {
  if (user_name) {
    const existing = await User.findOne({
      where: { user_name, id: { [Op.ne]: userId } },
    });
    if (existing) {
      const error = new Error("Username already taken");
      error.status = 409;
      throw error;
    }
  }

  const user = await User.findByPk(userId);
  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  await user.update({ ...(name && { name }), ...(user_name && { user_name }) });
  const { password: _, ...userWithoutPassword } = user.toJSON();
  return userWithoutPassword;
};

const changePassword = async (userId, { oldPassword, newPassword }) => {
  const user = await User.findByPk(userId);
  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    const error = new Error("Old password is incorrect");
    error.status = 401;
    throw error;
  }

  await user.update({ password: await bcrypt.hash(newPassword, 10) });
  return { message: "Password updated successfully" };
};

const searchUsers = async (query) => {
  if (!query || query.trim().length < 2) {
    const error = new Error("Search query must be at least 2 characters");
    error.status = 400;
    throw error;
  }

  return await User.findAll({
    where: {
      [Op.or]: [
        { name: { [Op.like]: `%${query}%` } },
        { user_name: { [Op.like]: `%${query}%` } },
        { email: { [Op.like]: `%${query}%` } },
      ],
    },
    attributes: ["id", "name", "user_name", "email", "avatar_url"],
    limit: 20,
  });
};

const deleteAccount = async (userId) => {
  const user = await User.findByPk(userId);
  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }
  await user.destroy();
};

module.exports = {
  getMe,
  updateProfile,
  changePassword,
  searchUsers,
  deleteAccount,
};
