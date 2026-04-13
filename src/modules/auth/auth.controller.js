const authService = require("./auth.service");

const register = async (req, res) => {
  try {
    const result = await authService.register(req.body);
    return res
      .status(201)
      .json({ message: "User created successfully", data: result });
  } catch (error) {
    return res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

const login = async (req, res) => {
  try {
    const result = await authService.login(req.body);
    return res.status(200).json({ message: "Login successful", data: result });
  } catch (error) {
    return res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

module.exports = { register, login };
