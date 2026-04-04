const authService = require("./auth.service");

const register = async (req, res, next) => {
  try {
    const { name, user_name, email, password } = req.body;

    const result = await authService.register({
      name,
      user_name,
      email,
      password,
    });

    res.status(201).json({
      message: "User created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login({
      email,
      password,
    });
    res.status(200).json({
      message: "Login Successfull",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login };
