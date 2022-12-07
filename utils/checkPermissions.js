const Error = require("../errors");

const checkPermissions = (requestUser, resourceUserId) => {
  //   console.log(requestUser);
  //   console.log(resourceUserId);
  //   console.log(typeof requestUser);
  //   console.log(typeof resourceUserId);
  if (requestUser.role === "admin") return;
  if (requestUser.userId === resourceUserId.toString() /* perché é un Object */)
    return;
  throw new Error.UnauthorizedError("Not Authorized to access");
};

module.exports = checkPermissions;
