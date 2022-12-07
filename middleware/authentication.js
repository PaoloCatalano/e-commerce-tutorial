const Error = require("../errors");
const { isTokenValid } = require("../utils");

const authenticateUser = async (req, res, next) => {
  const token = req.signedCookies.token_name;

  if (!token) {
    throw new Error.UnauthenticatedError("Authentication Invalid");
  }

  try {
    const { name, userId, role } = isTokenValid(token);
    req.user = { name, userId, role };
    next();
  } catch (error) {
    throw new Error.UnauthenticatedError("Authentication Invalid");
  }
};

const authorizePermissions = (...roles) => {
  // authorize ONLY the admin
  //   if (req.user.role !== "admin") {
  //     throw new Error.UnauthorizedError("Unauthorized to access");
  //   }
  //   next();
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new Error.UnauthorizedError("Unauthorized to access");
    }
    next();
  };
};

module.exports = { authenticateUser, authorizePermissions };
