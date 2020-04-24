const { companyName: appName } = require("../configs/business.config");
const authConfig = require("../configs/auth.config");

function cookieNames(req) {
  let authForName = "";
  switch (req.authFor) {
    default:
    case authConfig.identifier.USER: {
      authForName = "Shop";
      break;
    }
    case authConfig.identifier.STAFF: {
      authForName = "Manage";
      break;
    }
  }
  return {
    accessToken: [appName, authForName, "AccessToken"].join("_"),
    refreshToken: [appName, authForName, "RefreshToken"].join("_")
  };
}
exports.cookieNames = cookieNames;

exports.setCookie = (res, cookie, value, expires) => {
  res.cookie(cookie, value, {
    expires: new Date(Date.now() + expires),
    httpOnly: true
  });
};
