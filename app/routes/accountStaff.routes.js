const express = require("express");

const router = express.Router();
const { check, query } = require("express-validator");

const { manageRoles } = require("../configs/business.config");
const { isAuth, hasRole } = require("../middlewares/auth.middleware");
const accountStaffController = require("../controllers/accountStaff.controller");

router.get("/meInfo", isAuth, hasRole(manageRoles), accountStaffController.getMeAccountStaff);

router.get("/roles", isAuth, hasRole(manageRoles), accountStaffController.getStaffRoles);

router.get("/:accountStaffId", isAuth, hasRole(["admin"]), accountStaffController.getAccountStaff);

router.get(
  "/",
  isAuth,
  hasRole(["admin"]),
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
      .matches(/^(id|username|email|createdAt|updatedAt|accountStaffId|locked|roleId)$/)
      .withMessage("value is not valid"),
    query("sortDesc").toBoolean(),
    query("roleId").optional(),
    query("locked").optional()
  ],
  accountStaffController.getAccountStaffs
);

router.post(
  "/signup",
  isAuth,
  hasRole(["admin"]),
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
    check("roleId")
      .not()
      .isEmpty()
      .withMessage("Required."),
    check("locked").optional()
  ],
  accountStaffController.performStaffSignUp
);

router.patch(
  "/meInfo/password",
  isAuth,
  hasRole(manageRoles),
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
  accountStaffController.updateMeAccountStaffPassword
);

router.patch(
  "/:accountStaffId/password",
  isAuth,
  hasRole(["admin"]),
  [
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
  accountStaffController.updateAccountStaffPassword
);

router.patch(
  "/:accountStaffId/role",
  isAuth,
  hasRole(["admin"]),
  [
    check("role")
      .not()
      .isEmpty()
      .withMessage("is required")
  ],
  accountStaffController.updateStaffRole
);

router.patch(
  "/:accountStaffId/locked",
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
  accountStaffController.updateAccountStaffLocked
);

router.delete(
  "/:accountStaffId",
  isAuth,
  hasRole(["admin"]),
  accountStaffController.deleteAccountStaff
);

module.exports = router;
