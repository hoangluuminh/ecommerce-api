const express = require("express");
const authRoutes = require("./auth.routes");

const router = express.Router();

const { authSetup } = require("../middlewares/auth.middleware");

const accountUserRoutes = require("./accountUser.routes");
const accountStaffRoutes = require("./accountStaff.routes");

// MIDDLEWARES
router.use(authSetup); // setup for req.authFor

// ROUTE HANDLERS

router.use("/auth", authRoutes);

router.use("/accountUser", accountUserRoutes);
router.use("/accountStaff", accountStaffRoutes);

module.exports = router;
