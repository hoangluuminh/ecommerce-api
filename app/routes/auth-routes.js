const express = require("express");

const router = express.Router();
const { check, cookie } = require("express-validator");

const { isAuth } = require("../middlewares/auth-middleware");
const authController = require("../controllers/auth-controller");
const { cookieNames } = require("../utils/cookie-utils");

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
    cookie(cookieNames.refreshToken)
      .isEmpty()
      .withMessage("Already logged in")
  ],
  authController.performLogin
);

router.post("/signout", isAuth, authController.performSignOut);

router.post("/signout-allsessions", isAuth, authController.performSignOutAllSessions);

router.post(
  "/refresh-token",
  [
    cookie(cookieNames.refreshToken)
      .not()
      .isEmpty()
      .withMessage("Must be logged in")
  ],
  authController.performRefreshToken
);

module.exports = router;
