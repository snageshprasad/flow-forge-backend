const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../../config/db");
const { Op } = require("sequelize");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

const register = async ({ name, user_name, email, password }) => {
  if (!name || !user_name || !email || !password) {
    const error = new Error("All fields are required");
    error.status = 400;
    throw error;
  }

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    const error = new Error("Email already exists");
    error.status = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    user_name,
    email,
    password: hashedPassword,
  });
  const { password: _, ...userWithoutPassword } = user.toJSON();
  const token = generateToken(user.id);

  return { user: userWithoutPassword, token };
};

const login = async ({ identifier, password }) => {
  if (!identifier || !password) {
    const error = new Error("Email/username and password are required");
    error.status = 400;
    throw error;
  }

  const user = await User.findOne({
    where: {
      [Op.or]: [{ email: identifier }, { user_name: identifier }],
    },
  });

  if (!user) {
    const error = new Error("Invalid credentials");
    error.status = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error = new Error("Invalid credentials");
    error.status = 401;
    throw error;
  }

  const { password: _, ...userWithoutPassword } = user.toJSON();
  const token = generateToken(user.id);

  return { user: userWithoutPassword, token };
};

module.exports = { register, login };
