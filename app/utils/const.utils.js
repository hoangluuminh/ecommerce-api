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
    //
    ITEM: ["InvalidItemError", "Specified item cannot be found", 400],
    ATTRIBUTE: ["InvalidAttributeError", "Specified attribute cannot be found", 400],
    SCALE: ["InvalidScaleError", "Specified scale cannot be found", 400],
    TYPE: ["InvalidTypeError", "Specified type cannot be found", 400],
    MAKER: ["InvalidMakerError", "Specified maker cannot be found", 400],
    BRAND: ["InvalidBrandError", "Specified brand cannot be found", 400],
    INVENTORY: ["InvalidInventoryError", "Specified inventory item cannot be found", 400],
    ITEMVARIATION: ["InvalidItemVariationError", "Specified item variation cannot be found", 400],
    SHOP: ["InvalidShopError", "Specified shop cannot be found", 400],
    ORDER: ["InvalidOrderError", "Specified order cannot be found", 400],
    ORDERSTATUS: ["InvalidOrderStatusError", "Specified order status cannot be found", 400],
    PROMOTION: ["InvalidPromotionError", "Specified promotion cannot be found", 400],
    //
    ACCOUNTUSER: ["InvalidAccountUserError", "Specified user cannot be found", 400],
    ACCOUNTSTAFF: ["InvalidAccountStaffError", "Specified staff cannot be found", 400],
    OLDPASSWORD: ["InvalidOldPasswordError", "Incorrect password for current account", 400],
    STAFF_ROLE: ["InvalidRoleError", "Specified role does not exist", 400]
  },
  DUPLICATE: {
    INVENTORY: ["DuplicateInventoryError", "Found duplication of Inventory Item IDs", 400]
  },
  UNIQUE: {
    USER_USERNAME: ["UniqueUserUsernameError", "Username already exists", 400],
    USER_EMAIL: ["UniqueUserEmailError", "Email already exists", 400],
    ITEM: ["UniqueItemError", "Item already exists", 400],
    SCALE: ["UniqueScaleError", "Scale already exists", 400],
    TYPE: ["UniqueTypeError", "Type already exists", 400],
    MAKER: ["UniqueMakerError", "Maker already exists", 400],
    BRAND: ["UniqueBrandError", "Brand already exists", 400],
    ATTRIBUTE: ["DuplicateAttributeError", "Attribute already exists", 400],
    INVENTORY: ["UniqueInventoryError", "One of the provided indentifiers already exists", 400],
    PROMOTION: ["DuplicatePromotionError", "Promotion already exists", 400]
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
    MEDIA_FILESIZE: ["ExceedingFileSizeError", "Maximum size exceeded.", 400],
    ITEM_VARIATIONMISSING: [
      "ItemVariationMissingError",
      "Existing variations are missing from the provided variation list",
      400
    ],
    INVENTORY_BOUGHT: ["InventoryBoughtError", "Bought inventory item cannot be updated.", 400],
    INVENTORY_INCORRECTITEM: [
      "InventoryIncorrectItemError",
      "Inventory item's variation must belongs to its item.",
      400
    ],
    INVENTORY_INCORRECTVARIATION: [
      "InventoryIncorrectVariationError",
      "Specified Inventory item does not belong to its variation.",
      400
    ],
    INVENTORY_UNAVAILABLE: [
      "InventoryUnavailableError",
      "This inventory item is not available.",
      400
    ],
    ATTRIBUTE_DYNAMIC: [
      "AttributeDynamicValueError",
      "Value for dynamic attribute must be a number",
      400
    ],
    ORDER_CARTVARIATION: [
      "OrderIncorrectVariationError",
      "One of the specified variations does not belong to its item.",
      400
    ],
    ORDER_QUANTITY: ["OrderQuantityError", "Insufficient stock for demanded item.", 400],
    ORDER_FORBIDDEN: ["OrderForbiddenError", "This action cannot be performed on this order.", 400],
    ORDER_EXCEEDDOWNPAYMENT: [
      "OrderExceedDownpaymentError",
      "Downpayment must be below 85% of Total Payment.",
      400
    ],
    ORDERDETAIL_MISMATCH: [
      "OrderDetailMismatchError",
      "Supplied Order details and saved Order details have Variations mismatch.",
      400
    ]
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
    },
    PAYMENT: [
      "UnknownPaymentError",
      "Payment transaction error occurred. Please try again later",
      500
    ]
  }
};
