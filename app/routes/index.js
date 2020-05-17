const express = require("express");

const router = express.Router();

const { authSetup } = require("../middlewares/auth.middleware");

const authRoutes = require("./auth.routes");
const mediaRoutes = require("./media.routes");
const paymentRoutes = require("./payment.routes");

const accountUserRoutes = require("./accountUser.routes");
const accountStaffRoutes = require("./accountStaff.routes");

const itemRoutes = require("./item.routes");
const attributeRoutes = require("./attribute.routes");
const typeRoutes = require("./type.routes");
const brandRoutes = require("./brand.routes");

const inventoryRoutes = require("./inventory.routes");
const shopRoutes = require("./shop.routes");
const orderRoutes = require("./order.routes");

// MIDDLEWARES
router.use(authSetup); // setup for req.authFor

// ROUTE HANDLERS

router.use("/auth", authRoutes);
router.use("/media", mediaRoutes);
router.use("/payment", paymentRoutes);

router.use("/accountUser", accountUserRoutes);
router.use("/accountStaff", accountStaffRoutes);

router.use("/items", itemRoutes);
router.use("/attributes", attributeRoutes);
router.use("/types", typeRoutes);
router.use("/brands", brandRoutes);

router.use("/inventories", inventoryRoutes);
router.use("/shop", shopRoutes);
router.use("/orders", orderRoutes);

module.exports = router;
