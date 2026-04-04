const { User } = require("../../config/db");
const { Op } = require("sequelize");

const createUser = async (data) => {
  return await User.create(data);
};

const findByEmail = async (email) => {
  return await User.findOne({ where: { email } });
};

const findById = async (id) => {
  return await User.findByPk(id);
};

const searchUsers = async (query) => {
  return await User.findAll({
    where: {
      [Op.or]: [
        { name: { [Op.like]: `%${query}%` } },
        { user_name: { [Op.like]: `%${query}%` } },
        { email: query },
      ],
    },
  });
};

module.exports = { createUser, findByEmail, findById, searchUsers };