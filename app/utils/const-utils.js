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
    ITEM: ["InvalidItemError", "Specified item cannot be found", 400],
    ITEMIMG: ["InvalidItemImgError", "Cannot find image", 400],
    ITEMIMGS: ["InvalidItemImgsError", "Cannot find images", 400],
    BRAND: ["InvalidBrandError", "Specified brand cannot be found", 400],
    BRANDS: ["InvalidBrandsError", "One of the specified brands cannot be found", 400],
    BRAND_PARENT: ["InvalidParentBrandError", "Specified parent brand cannot be found", 400],
    CATEGORY: ["InvalidCategoryError", "Specified category cannot be found", 400],
    AUTH_TOKEN: ["InvalidTokenError", "Invalid refresh token", 403],
    USER: ["InvalidUserError", "Specified user cannot be found", 400],
    USER_ROLE: ["InvalidRoleError", "Specified role does not exist", 400]
  },
  DUPLICATE: {
    ITEM: ["DuplicateItemError", "Item already exists", 400],
    ITEMIMGURL: ["DuplicateItemImgURLError", "Image with specified URL already exists", 400],
    BRAND: ["DuplicateBrandError", "Brand with specified id already exists", 400],
    CATEGORY: ["DuplicateCategoryError", "Category with specified id already exists", 400]
  },
  UNIQUE: {
    USER_USERNAME: ["UniqueUserUsernameError", "Username already exists", 400],
    USER_EMAIL: ["UniqueUserEmailError", "Email already exists", 400]
  },
  AUTH: {
    UNAUTHENTICATED: ["AuthUnauthenticatedError", "Unauthenticated", 401],
    UNAUTHORIZED: ["AuthUnauthorizedError", "Unauthorized", 403],
    SESSIONEXPIRED: ["AuthTokenExpiredError", "Session Expired", 403],
    LOGIN_USERNAME: ["AuthUsernameError", "Invalid username or password", 400],
    LOGIN_PASSWORD: ["AuthPasswordError", "Invalid username or password", 400]
  },
  MISC: {
    ROUTE: ["RouteError", "Could not find this route.", 404],
    BRANDS_PARENTING: ["BrandsParentingError", "The brands belong to different parents", 400],
    BRANDS_UNDELETABLEPARENT: ["UndeletableParentBrandError", "You cannot delete parent brand", 400]
  },
  UNKNOWN: {
    GET: {
      ITEM: ["UnknownGetItemError", "Retrieving item unsuccessful. Please try again later", 500],
      ITEMS: ["UnknownGetItemsError", "Retrieving items unsuccessful. Please try again later", 500],
      BRAND: ["UnknownGetBrandError", "Retrieving brand unsuccessful. Please try again later", 500],
      BRANDS: [
        "UnknownGetBrandsError",
        "Retrieving brands unsuccessful. Please try again later",
        500
      ],
      CATEGORY: [
        "UnknownGetCategoryError",
        "Retrieving category unsuccessful. Please try again later",
        500
      ],
      CATEGORIES: [
        "UnknownGetCategoriesError",
        "Retrieving categories unsuccessful. Please try again later",
        500
      ],
      USER: ["UnknownGetUserError", "Retrieving user unsuccessful. Please try again later", 500],
      USER_MEINFO: [
        "UnknownGetMeInfoError",
        "Retrieving current user unsuccessful. Please try again later",
        500
      ],
      USERS: ["UnknownGetUsersError", "Retrieving users unsuccessful. Please try again later", 500]
    },
    ADD: {
      ITEM: ["UnknownAddItemError", "Adding item unsuccessful. Please try again later", 500],
      ITEMIMG: [
        "UnknownAddItemImgError",
        "Adding image to item unsuccessful. Please try again later",
        500
      ],
      BRAND: ["UnknownAddBrandError", "Adding brand unsuccessful. Please try again later", 500],
      CATEGORY: [
        "UnknownAddCategoryError",
        "Adding category unsuccessful. Please try again later",
        500
      ],
      USER: ["UnknownAddUserError", "Signup unsuccessful", 500]
    },
    UPDATE: {
      ITEM: ["UnknownUpdateItemError", "Updating item unsuccessful. Please try again later", 500],
      ITEM_REMAIN: [
        "UnknownSetItemRemainError",
        "Set item remain unsuccessful. Please try again later",
        500
      ],
      BRAND: [
        "UnknownUpdateBrandError",
        "Updating brand unsuccessful. Please try again later",
        500
      ],
      CATEGORY: [
        "UnknownUpdateCategoryError",
        "Updating category unsuccessful. Please try again later",
        500
      ],
      USER_MEINFO: [
        "UnknownUpdateMeInfoError",
        "Updating current user unsuccessful. Please try again later",
        500
      ],
      USER_MEPASSWORD: [
        "UnknownUpdateMePasswordError",
        "Updating current user's password unsuccessful. Please try again later",
        500
      ],
      USER_PASSWORD: [
        "UnknownUpdateUserPasswordError",
        "Updating user's password unsuccessful. Please try again later",
        500
      ],
      USER_ROLE: [
        "UnknownUpdateUserRoleError",
        "Updating user's role unsuccessful. Please try again later",
        500
      ],
      USER_LOCKED: [
        "UnknownUpdateUserLockedError",
        "Updating user's locked status unsuccessful. Please try again later",
        500
      ]
    },
    SWAP: {
      ITEMIMGS: [
        "UnknownSwapItemImgsError",
        "Swapping item images unsuccessful. Please try again later",
        500
      ],
      BRANDS: [
        "UnknownSwapBrandsError",
        "Swapping brands unsuccessful. Please try again later",
        500
      ]
    },
    DELETE: {
      ITEM: ["UnknownDeleteItemError", "Deleting item unsuccessful. Please try again later", 500],
      ITEMIMG: [
        "UnknownDeleteItemImgError",
        "Deleting item image unsuccessful. Please try again later",
        500
      ],
      BRAND: [
        "UnknownDeleteBrandError",
        "Deleting brand unsuccessful. Please try again later",
        500
      ],
      CATEGORY: [
        "UnknownDeleteCategory",
        "Deleting category unsuccessful. Please try again later",
        500
      ],
      USER: ["UnknownDeleteUserError", "Terminating user unsuccessful. Please try again later", 500]
    },
    MISC: {
      AUTH_LOGIN: ["UnknownLoginError", "Login unsuccessful", 500],
      AUTH_LOGOUT: ["UnknownLogoutError", "Logout failed", 403],
      AUTH_LOGOUTSESSIONS: ["UnknownLogoutSessionsError", "Logout all sessions failed", 403]
    }
  }
};
