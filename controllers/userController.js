const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const Error = require("../errors");
const {
  createTokenUser,
  attachCookiesToResponse,
  checkPermissions,
} = require("../utils");

const getAllUsers = async (req, res) => {
  const users = await User.find({ role: "user" }).select(
    "-password  -role -__v"
  );
  res.status(StatusCodes.OK).json({ users });
};

const getSingleUser = async (req, res) => {
  const user = await User.findOne({ _id: req.params.id }).select(
    "-password -role -__v"
  );
  if (!user) {
    throw Error.NotFoundError(`No user with id: ${req.params.id}`);
  }
  checkPermissions(req.user, user._id);
  res.status(StatusCodes.OK).json({ user });
};

const showCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};
//

/**  Update user with findOneAndUpdate method */

// const updateUser = async (req, res) => {
//   const { email, name } = req.body;
//   if (!email || !name) {
//     throw new Error.BadRequestError("Please provide name and email");
//   }
//   const user = await User.findOneAndUpdate(
//     { /* filter */ _id: req.user.userId },
//     { /* what to update */ email, name },
//     {
//       /* options */ new: true,
//       runValidators: true,
//     }
//   );
//   const tokenUser = createTokenUser(user);
//   attachCookiesToResponse({ res, user: tokenUser });
//   res.status(StatusCodes.OK).json({ user: tokenUser });
// };
//

/**  Update user with user.save method */

const updateUser = async (req, res) => {
  const { email, name } = req.body;
  if (!email || !name) {
    throw new Error.BadRequestError("Please provide name and email");
  }

  const user = await User.findOne({ _id: req.user.userId });

  user.email = email;
  user.name = name;

  await user.save();

  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.OK).json({ user: tokenUser });
};
const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new Error.BadRequestError("Please provide both values");
  }
  const user = await User.findOne({ _id: req.user.userId });

  const isPasswordCorrect = await user.comparePassword(oldPassword);
  if (!isPasswordCorrect) {
    throw new Error.UnauthenticatedError("Invalid credentials");
  }

  user.password = newPassword;

  await user.save();
  res.status(StatusCodes.OK).json({ msg: "password updated correctly" });
};

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};
