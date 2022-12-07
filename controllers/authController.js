const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const C_Err = require("../errors");
const { attachCookiesToResponse, createTokenUser } = require("../utils");

const register = async (req, res) => {
  const { email, name, password } = req.body;

  const emailAlreadyExists = await User.findOne({ email });
  if (emailAlreadyExists) {
    throw new C_Err.BadRequestError("Email already exists");
  }

  // first registered user is an admin
  const isFirstAccount = (await User.countDocuments({})) === 0;
  const role = isFirstAccount ? "admin" : "user";

  const user = await User.create({ email, name, password, role });

  //token
  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.CREATED).json({ user: tokenUser });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  //1 step: email e password?
  if (!email || !password) {
    throw new C_Err.BadRequestError("Please provide email and password");
  }
  //2 step: recuperare l'user tramite email
  const user = await User.findOne({ email });
  //3 step: user?
  if (!user) {
    throw new C_Err.UnauthenticatedError("Invalid credentials");
  }
  //4 step: password corretta?
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new C_Err.UnauthenticatedError("Invalid credentials");
  }
  //5 step: creare il token
  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.OK).json({ user: tokenUser });
};

const logout = async (req, res) => {
  res.cookie("token_name", "logout", {
    httpOnly: true,
    expires: new Date(Date.now() + 1000),
  });
  res.send("logout");
};

module.exports = {
  register,
  login,
  logout,
};
