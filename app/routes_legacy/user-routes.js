const express = require("express");

const router = express.Router();
const { check, query } = require("express-validator");

const { isAuth, hasRole } = require("../middlewares/auth-middleware");
const userController = require("../controllers/user-controller");

const userInfoChecks = [
  check("lastname")
    .not()
    .isEmpty()
    .withMessage("is required"),
  check("firstname")
    .not()
    .isEmpty()
    .withMessage("is required")
];

router.get("/meInfo", isAuth, userController.getMeInfo);

router.get("/:userAccountId", isAuth, hasRole(["admin"]), userController.getUser);

router.get(
  "/",
  isAuth,
  hasRole(["admin"]),
  [
    // query('query').not().isEmpty().withMessage('is required'),
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
      .matches(/^(id|username|email|lastname|firstname|role|locked|createdAt|updatedAt)$/)
      .withMessage("value is not valid"),
    query("sortDesc").toBoolean()
  ],
  userController.getUsers
);

router.post(
  "/signup",
  [
    check("username")
      .not()
      .isEmpty()
      .withMessage("is required"),
    check("password")
      .not()
      .isEmpty()
      .withMessage("is required"),
    check("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("has invalid format")
    // check('lastname').not().isEmpty().withMessage('is required'),
    // check('firstname').not().isEmpty().withMessage('is required'),
  ],
  userController.performSignUp
);

router.put("/meInfo", isAuth, userInfoChecks, userController.updateMeInfo);

router.patch(
  "/meInfo/password",
  isAuth,
  [
    check("password")
      .not()
      .isEmpty()
      .withMessage("is required")
  ],
  userController.updateMePassword
);

router.patch(
  "/:userAccountId/password",
  isAuth,
  hasRole(["admin"]),
  [
    check("password")
      .not()
      .isEmpty()
      .withMessage("is required")
  ],
  userController.updateUserPassword
);

router.patch(
  "/:userAccountId/role",
  isAuth,
  hasRole(["admin"]),
  [
    check("role")
      .not()
      .isEmpty()
      .withMessage("is required")
  ],
  userController.updateUserRole
);

router.patch(
  "/:userAccountId/locked",
  isAuth,
  hasRole(["admin"]),
  [
    check("locked")
      .not()
      .isEmpty()
      .withMessage("is required"),
    check("locked")
      .isBoolean()
      .withMessage("must be boolean")
  ],
  userController.updateUserLocked
);

router.delete("/:userAccountId", isAuth, hasRole(["admin"]), userController.deleteUser);

module.exports = router;
