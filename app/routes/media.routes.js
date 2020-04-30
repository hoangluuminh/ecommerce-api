const express = require("express");

const router = express.Router();
const { check } = require("express-validator");

const { isAuth } = require("../middlewares/auth.middleware");
const mediaController = require("../controllers/media.controller");

router.get("/images/uploads/:url", mediaController.displayImage);

router.post("/images", isAuth, mediaController.uploadImages);

module.exports = router;
