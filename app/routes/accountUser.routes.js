const express = require("express");

const router = express.Router();
const { check, query } = require("express-validator");

const { isAuth, hasRole } = require("../middlewares/auth.middleware");
const accountUserController = require("../controllers/accountUser.controller");

const userInfoChecks = [
  check("lastName")
    .not()
    .isEmpty()
    .withMessage("Required."),
  check("firstName")
    .not()
    .isEmpty()
    .withMessage("Required."),
  check("phone").optional(),
  check("gender").optional(),
  check("birthday") // TODO: Validate DATETIME
    .not()
    .isEmpty()
    .withMessage("Must be a date.")
];

router.get("/meInfo", isAuth, hasRole(["user"]), accountUserController.getMeAccountUser);

router.get(
  "/:accountUserId",
  isAuth,
  hasRole(["admin", "manager", "merchandiser", "support"]),
  accountUserController.getAccountUser
);

router.get(
  "/",
  isAuth,
  hasRole(["admin", "manager", "merchandiser", "support"]),
  [
    query("query").optional(),
    query("page")
      .custom(value => value > 0)
      .isNumeric({ no_symbols: true })
      .toInt()
      .withMessage("must be a number"),
    query("size")
      .isNumeric({ no_symbols: true })
      .toInt()
      .withMessage("must be a number"),
    query("sort")
      .matches(
        /^(id|username|email|createdAt|updatedAt|accountUserId|locked|lastName|firstName|phone|gender|birthday)$/
      )
      .withMessage("value is not valid"),
    query("sortDesc").toBoolean(),
    query("locked").optional()
  ],
  accountUserController.getAccountUsers
);

router.post(
  "/signup",
  [
    check("username")
      .not()
      .isEmpty()
      .withMessage("Required."),
    check("password")
      .not()
      .isEmpty()
      .withMessage("Required."),
    check("password2")
      .not()
      .isEmpty()
      .custom((value, { req }) => value === req.body.password)
      .withMessage("Must be the same as password."),
    check("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("has invalid format"),
    check("locked").optional(),
    userInfoChecks
  ],
  accountUserController.performUserSignUp
);

router.put(
  "/meInfo",
  isAuth,
  hasRole(["user"]),
  userInfoChecks,
  accountUserController.updateMeAccountUser
);

router.patch(
  "/meInfo/password",
  isAuth,
  hasRole(["user"]),
  [
    check("oldPassword")
      .not()
      .isEmpty()
      .withMessage("Required."),
    check("password")
      .not()
      .isEmpty()
      .withMessage("Required."),
    check("password2")
      .not()
      .isEmpty()
      .custom((value, { req }) => value === req.body.password)
      .withMessage("Must be the same as password.")
  ],
  accountUserController.updateMeAccountUserPassword
);

router.patch(
  "/:accountUserId/password",
  isAuth,
  hasRole(["admin"]),
  [
    check("oldPassword")
      .not()
      .isEmpty()
      .withMessage("Required."),
    check("password")
      .not()
      .isEmpty()
      .withMessage("Required."),
    check("password2")
      .not()
      .isEmpty()
      .custom((value, { req }) => value === req.body.password)
      .withMessage("Must be the same as password.")
  ],
  accountUserController.updateAccountUserPassword
);

router.patch(
  "/:accountUserId/locked",
  isAuth,
  hasRole(["admin"]),
  [
    check("locked")
      .not()
      .isEmpty()
      .withMessage("Required."),
    check("locked")
      .isBoolean()
      .withMessage("Must be boolean.")
  ],
  accountUserController.updateAccountUserLocked
);

router.delete(
  "/:accountUserId",
  isAuth,
  hasRole(["admin"]),
  accountUserController.deleteAccountUser
);

module.exports = router;
