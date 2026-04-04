const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userRepository = require("../user/user.repository");


const register = async (data) => {
  const { email, password } = data;

  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    throw new Error("Email already exists");
  }

  data.password = await bcrypt.hash(password, 10);

  const user = await userRepository.createUser(data);
  user.password = undefined;
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  return { user, token };
};


const login = async (data) => {
  const { email, password } = data;

  const existingUser = await userRepository.findByEmail(email);
  if (!existingUser) {
    throw new Error("User not found");
  }

  const isMatch = await bcrypt.compare(password, existingUser.password);
  if (!isMatch) {
    throw new Error("Invalid Password");
  }

  existingUser.password = undefined;

  const token = jwt.sign({ id: existingUser.id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  return { user: existingUser, token };
};

module.exports = { register, login };
