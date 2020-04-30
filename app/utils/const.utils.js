exports.INT_MAX = Number.MAX_SAFE_INTEGER;
exports.TOKENLIFE = {
  access: process.env.ACCESS_TOKEN_LIFE,
  refresh: process.env.REFRESH_TOKEN_LIFE
};
exports.SECRETKEY = {
  access: process.env.ACCESS_TOKEN_SECRET,
  refresh: process.env.REFRESH_TOKEN_SECRET
};

exports.ERRORS = {
  INVALID: {
    AUTH_TOKEN: ["InvalidTokenError", "Invalid refresh token", 403],
    MEDIA_TYPE: ["InvalidFileTypeError", "Invalid file type", 400],
    MEDIA_URL: ["InvalidMediaUrlError", "File with specified name cannot be found", 404],
    // ITEM: ["InvalidItemError", "Specified item cannot be found", 400],
    // ITEMIMG: ["InvalidItemImgError", "Cannot find image", 400],
    // ITEMIMGS: ["InvalidItemImgsError", "Cannot find images", 400],
    // BRAND: ["InvalidBrandError", "Specified brand cannot be found", 400],
    // BRANDS: ["InvalidBrandsError", "One of the specified brands cannot be found", 400],
    // BRAND_PARENT: ["InvalidParentBrandError", "Specified parent brand cannot be found", 400],
    // CATEGORY: ["InvalidCategoryError", "Specified category cannot be found", 400],
    ACCOUNTUSER: ["InvalidAccountUserError", "Specified user cannot be found", 400],
    ACCOUNTSTAFF: ["InvalidAccountStaffError", "Specified staff cannot be found", 400],
    OLDPASSWORD: ["InvalidOldPasswordError", "Incorrect password for current account", 400],
    STAFF_ROLE: ["InvalidRoleError", "Specified role does not exist", 400]
  },
  DUPLICATE: {
    // ITEM: ["DuplicateItemError", "Item already exists", 400],
    // ITEMIMGURL: ["DuplicateItemImgURLError", "Image with specified URL already exists", 400],
    // BRAND: ["DuplicateBrandError", "Brand with specified id already exists", 400],
    // CATEGORY: ["DuplicateCategoryError", "Category with specified id already exists", 400]
  },
  UNIQUE: {
    USER_USERNAME: ["UniqueUserUsernameError", "Username already exists", 400],
    USER_EMAIL: ["UniqueUserEmailError", "Email already exists", 400]
  },
  AUTH: {
    UNAUTHENTICATED: ["AuthUnauthenticatedError", "Unauthenticated", 401],
    UNAUTHORIZED: ["AuthUnauthorizedError", "Unauthorized", 403],
    SESSIONEXPIRED: ["AuthTokenExpiredError", "Session Expired", 403],
    ISLOCKED: ["AuthIsLockedError", "This account has been locked", 403],
    LOGIN_USERNAME: ["AuthUsernameError", "Invalid username/email or password", 400],
    LOGIN_PASSWORD: ["AuthPasswordError", "Invalid username/email or password", 400]
  },
  MISC: {
    ROUTE: ["RouteError", "Could not find this route.", 404],
    MEDIA_FILESIZE: ["ExceedingFileSizeError", "Maximum size exceeded.", 400]
    // BRANDS_PARENTING: ["BrandsParentingError", "The brands belong to different parents", 400],
    // BRANDS_UNDELETABLEPARENT: ["UndeletableParentBrandError", "You cannot delete parent brand", 400]
  },
  UNKNOWN: {
    GET: ["UnknownGetError", "Retrieving unsuccessful. Please try again later", 500],
    ADD: ["UnknownAddError", "Adding unsuccessful. Please try again later", 500],
    UPDATE: ["UnknownUpdateError", "Updating unsuccessful. Please try again later", 500],
    SWAP: ["UnknownSwapImgsError", "Swapping unsuccessful. Please try again later", 500],
    DELETE: ["UnknownDeleteError", "Deleting unsuccessful. Please try again later", 500],
    UPLOAD: ["UnknownUploadError", "Uploading unsuccessful. Please try again later", 500],
    AUTH: {
      LOGIN: ["UnknownLoginError", "Login unsuccessful", 500],
      LOGOUT: ["UnknownLogoutError", "Logout failed", 403],
      LOGOUTSESSIONS: ["UnknownLogoutSessionsError", "Logout all sessions failed", 403]
    }
  }
};
