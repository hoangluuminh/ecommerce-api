const express = require("express");

const router = express.Router();
const { check, cookie } = require("express-validator");

const { isAuth } = require("../middlewares/auth.middleware");
const authController = require("../controllers/auth.controller");
const { cookieNames } = require("../utils/cookie.utils");
const authConfig = require("../configs/auth.config");

router.get("/check-auth", isAuth, authController.checkAuth);
router.post(
  "/check-role",
  isAuth,
  [
    check("roles")
      .not()
      .isEmpty()
      .withMessage("is required")
  ],
  authController.checkRole
);

router.post(
  "/login",
  [
    check("username")
      .not()
      .isEmpty()
      .withMessage("is required"),
    check("password")
      .not()
      .isEmpty()
      .withMessage("is required"),
    // check('remember').not().isEmpty().withMessage('is required'),
    cookie(cookieNames({ authFor: authConfig.identifier.USER }).refreshToken)
      .if((value, { req }) => req.authFor === authConfig.identifier.USER)
      .isEmpty()
      .withMessage("Must be logged out to perform login"),
    cookie(cookieNames({ authFor: authConfig.identifier.STAFF }).refreshToken)
      .if((value, { req }) => req.authFor === authConfig.identifier.STAFF)
      .isEmpty()
      .withMessage("Must be logged out to perform login")
  ],
  authController.performLogin
);

router.post("/signout", isAuth, authController.performSignOut);

router.post("/signout-allsessions", isAuth, authController.performSignOutAllSessions);

router.post(
  "/refresh-token",
  [
    cookie(cookieNames({ authFor: authConfig.identifier.USER }).refreshToken)
      .if((value, { req }) => req.authFor === authConfig.identifier.USER)
      .not()
      .isEmpty()
      .withMessage("Must be logged in"),
    cookie(cookieNames({ authFor: authConfig.identifier.STAFF }).refreshToken)
      .if((value, { req }) => req.authFor === authConfig.identifier.STAFF)
      .not()
      .isEmpty()
      .withMessage("Must be logged in")
  ],
  authController.performRefreshToken
);

module.exports = router;
