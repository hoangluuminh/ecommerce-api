const express = require("express");

const router = express.Router();

const { authSetup } = require("../middlewares/auth.middleware");

const authRoutes = require("./auth.routes");
const mediaRoutes = require("./media.routes");

const accountUserRoutes = require("./accountUser.routes");
const accountStaffRoutes = require("./accountStaff.routes");

// MIDDLEWARES
router.use(authSetup); // setup for req.authFor

// ROUTE HANDLERS

router.use("/auth", authRoutes);
router.use("/media", mediaRoutes);

router.use("/accountUser", accountUserRoutes);
router.use("/accountStaff", accountStaffRoutes);

module.exports = router;
