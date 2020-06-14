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
    AUTH_TOKEN: ["InvalidTokenError", "Refresh token không hợp lệ", 403],
    MEDIA_TYPE: ["InvalidFileTypeError", "Sai kiểu dữ liệu tập tin", 400],
    MEDIA_URL: ["InvalidMediaUrlError", "Không thể tìm thấy tập tin với tên xác định", 404],
    //
    ITEM: ["InvalidItemError", "Không thể tìm thấy Sản phẩm", 400],
    ATTRIBUTE: ["InvalidAttributeError", "Không thể tìm thấy Thuộc tính", 400],
    SCALE: ["InvalidScaleError", "Không thể tìm thấy Tỉ lệ", 400],
    TYPE: ["InvalidTypeError", "Không thể tìm thấy Phân loại", 400],
    MAKER: ["InvalidMakerError", "Không thể tìm thấy Nhà sản xuất", 400],
    BRAND: ["InvalidBrandError", "Không thể tìm thấy Thương hiệu", 400],
    INVENTORY: ["InvalidInventoryError", "Không thể tìm thấy món hàng trong kho", 400],
    ITEMVARIATION: ["InvalidItemVariationError", "Không thể tìm thấy Màu Sản phẩm", 400],
    SHOP: ["InvalidShopError", "Không thể tìm thấy cửa hàng", 400],
    ORDER: ["InvalidOrderError", "Không thể tìm thấy Đơn hàng", 400],
    ORDERSTATUS: ["InvalidOrderStatusError", "Không thể tìm thấy Trạng thái của Đơn hàng", 400],
    PROMOTION: ["InvalidPromotionError", "Không thể tìm thấy Sự kiện khuyến mãi", 400],
    SUPPORTTICKET: ["InvalidSupportTicketError", "Không thể tìm thấy Phiếu hỗ trợ", 400],
    SUPPORTTYPE: ["InvalidSupportTypeError", "Không thể tìm thấy loại hỗ trợ", 400],
    SUPPORTTICKETSTATUS: [
      "InvalidSupportTicketStatusError",
      "Không thể tìm thấy Trạng thái của Phiếu hỗ trợ",
      400
    ],
    ITEMCOMMENT: ["InvalidItemCommentError", "Không thể tìm thấy Bài đánh giá", 400],
    //
    ACCOUNTUSER: ["InvalidAccountUserError", "Không thể tìm thấy Khách hàng", 400],
    ACCOUNTSTAFF: ["InvalidAccountStaffError", "Không thể tìm thấy Nhân viên", 400],
    OLDPASSWORD: ["InvalidOldPasswordError", "Sai mật khẩu cho tài khoản hiện tại", 400],
    STAFF_ROLE: ["InvalidRoleError", "Không thể tìm thấy Vai trò", 400]
  },
  DUPLICATE: {
    INVENTORY: ["DuplicateInventoryError", "Phát hiện sự trùng lặp trong Mã món hàng", 400]
  },
  UNIQUE: {
    USER_USERNAME: ["UniqueUserUsernameError", "Tên tài khoản đã tồn tại", 400],
    USER_EMAIL: ["UniqueUserEmailError", "Email đã tồn tại", 400],
    ITEM: ["UniqueItemError", "Sản phẩm đã tồn tại", 400],
    SCALE: ["UniqueScaleError", "Tỉ lệ đã tồn tại", 400],
    TYPE: ["UniqueTypeError", "Phân loại đã tồn tại", 400],
    MAKER: ["UniqueMakerError", "Nhà sản xuất đã tồn tại", 400],
    BRAND: ["UniqueBrandError", "Thương hiệu đã tồn tại", 400],
    ATTRIBUTE: ["DuplicateAttributeError", "Thuộc tính đã tồn tại", 400],
    INVENTORY: ["UniqueInventoryError", "Một trong những Mã món hàng đã tồn tại", 400],
    PROMOTION: ["DuplicatePromotionError", "Sự kiện khuyến mãi đã tồn tại", 400],
    SUPPORTTICKET: ["DuplicateSupportTicketError", "Phiếu hỗ trợ đã tồn tại", 400]
  },
  AUTH: {
    UNAUTHENTICATED: ["AuthUnauthenticatedError", "Chưa đăng nhập", 401],
    UNAUTHORIZED: ["AuthUnauthorizedError", "Không đủ quyền truy cập", 403],
    SESSIONEXPIRED: ["AuthTokenExpiredError", "Hết hạn phiên làm việc", 403],
    ISLOCKED: ["AuthIsLockedError", "Tài khoản đã bị khoá", 403],
    LOGIN_USERNAME: ["AuthUsernameError", "Sai tài khoản / email hoặc mật khẩu", 400],
    LOGIN_PASSWORD: ["AuthPasswordError", "Sai tài khoản / email hoặc mật khẩu", 400]
  },
  MISC: {
    ROUTE: ["RouteError", "Không thể đi đến đường dẫn này", 404],
    MEDIA_FILESIZE: ["ExceedingFileSizeError", "Vượt kích thước cho phép", 400],
    ITEM_VARIATIONMISSING: [
      "ItemVariationMissingError",
      "Danh sách màu đã cung cấp còn thiếu màu",
      400
    ],
    INVENTORY_BOUGHT: ["InventoryBoughtError", "Món hàng đã mua không thể được cập nhật", 400],
    INVENTORY_INCORRECTITEM: [
      "InventoryIncorrectItemError",
      "Màu của món hàng phải thuộc về sản phẩm của nó",
      400
    ],
    INVENTORY_INCORRECTVARIATION: [
      "InventoryIncorrectVariationError",
      "Món hàng xác định phải thuộc về màu của nó",
      400
    ],
    INVENTORY_UNAVAILABLE: ["InventoryUnavailableError", "Món hàng này không tồn tại", 400],
    ATTRIBUTE_DYNAMIC: [
      "AttributeDynamicValueError",
      "Giá trị cho Thuộc tính Tĩnh phải là số",
      400
    ],
    ORDER_CARTVARIATION: [
      "OrderIncorrectVariationError",
      "Một trong những màu đã xác định không thuộc về sản phẩm của nó",
      400
    ],
    ORDER_QUANTITY: ["OrderQuantityError", "Số lượng tồn hàng không đủ đáp ứng yêu cầu", 400],
    ORDER_FORBIDDEN: [
      "OrderForbiddenError",
      "Hành động này không thể được thực hiện trên đơn hàng này",
      400
    ],
    ORDER_EXCEEDDOWNPAYMENT: [
      "OrderExceedDownpaymentError",
      "Downpayment must be below 85% of Total Payment.",
      400
    ],
    ORDERDETAIL_MISMATCH: [
      "OrderDetailMismatchError",
      "Phát hiện sai khớp về Màu giữa CT ĐHàng đã cung cấp và CTĐH trên CSDL",
      400
    ],
    ITEMCOMMENT_UNOWNED: [
      "ItemCommentUnownedError",
      "Bạn phải mua sản phẩm mới có thể đánh giá sản phẩm",
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

exports.ERRORS_EN = {
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
    SUPPORTTICKET: ["InvalidSupportTicketError", "Specified support ticket cannot be found", 400],
    SUPPORTTYPE: ["InvalidSupportTypeError", "Specified support type cannot be found", 400],
    SUPPORTTICKETSTATUS: [
      "InvalidSupportTicketStatusError",
      "Specified support ticket's status cannot be found",
      400
    ],
    ITEMCOMMENT: ["InvalidItemCommentError", "Specified item comment cannot be found", 400],
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
    PROMOTION: ["DuplicatePromotionError", "Promotion already exists", 400],
    SUPPORTTICKET: ["DuplicateSupportTicketError", "Support Ticket already exists", 400]
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
    ],
    ITEMCOMMENT_UNOWNED: [
      "ItemCommentUnownedError",
      "You must purchase this item in order to leave a review",
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
