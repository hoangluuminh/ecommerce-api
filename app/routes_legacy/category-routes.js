const express = require("express");

const router = express.Router();
const { check } = require("express-validator");

const categoryController = require("../controllers/category-controller");
const { isAuth, hasRole } = require("../middlewares/auth-middleware");

const categoryChecks = [
  check("name")
    .not()
    .isEmpty()
    .withMessage("is required")
];

router.get("/:categoryId", categoryController.getCategory);
router.get("/", categoryController.getCategories);

router.post(
  "/",
  isAuth,
  hasRole(["manager"]),
  [
    check("id")
      .not()
      .isEmpty()
      .withMessage("is required")
  ],
  categoryChecks,
  categoryController.addCategory
);

router.put(
  "/:categoryId",
  isAuth,
  hasRole(["manager"]),
  categoryChecks,
  categoryController.updateCategory
);

router.delete("/:categoryId", isAuth, hasRole(["manager"]), categoryController.deleteCategory);

module.exports = router;
