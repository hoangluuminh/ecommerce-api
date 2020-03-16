const express = require("express");

const router = express.Router();
const { check, query } = require("express-validator");

const { isAuth, hasRole } = require("../middlewares/auth-middleware");
const itemController = require("../controllers/item-controller");

const itemChecks = [
  check("name")
    .not()
    .isEmpty()
    .withMessage("is required"),
  // check('masp').not().isEmpty().withMessage('is required'),
  check("priceOg")
    .isNumeric()
    .withMessage("must be a number"),
  check("price")
    .isNumeric()
    .withMessage("must be a number"),
  check("price")
    .custom((v, { req }) => req.body.priceOg >= v)
    .withMessage("Original price must be lower than current price"),
  check("description")
    .not()
    .isEmpty()
    .withMessage("is required")
  // check('brand').not().isEmpty().withMessage('is required'),
  // check('category').not().isEmpty().withMessage('is required')
];

router.get("/:itemId", itemController.getItem);

router.get(
  "/",
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
      .matches(/^(name|masp|priceOg|price|brand|category|createdAt|updatedAt)$/)
      .withMessage("value is not valid"),
    query("sortDesc").toBoolean()
    // query('noImage').not().isEmpty().withMessage('is required'),
    // query('priceFrom').isNumeric().toInt().withMessage('must be a number'),
    // query('priceTo').isNumeric().toInt().withMessage('must be a number')
    // query('masp').not().isEmpty().withMessage('is required'),
    // query('brand').not().isEmpty().withMessage('is required'),
    // query('category').not().isEmpty().withMessage('is required'),
  ],
  itemController.getItems
);

router.post(
  "/",
  isAuth,
  hasRole(["manager"]),
  [
    check("id")
      .not()
      .isEmpty()
      .withMessage("is required"),
    check("itemImgs")
      .custom(v => v && Array.isArray(v) && v.length > 0)
      .withMessage("requires at least 1 itemImg")
  ],
  itemChecks,
  itemController.addItem
);

router.post(
  "/:itemId/imgs",
  isAuth,
  hasRole(["manager"]),
  [
    check("img")
      .not()
      .isEmpty()
      .withMessage("is required")
  ],
  itemController.addImgToItem
);

router.put("/:itemId", itemChecks, itemController.updateItem);

router.patch(
  "/:itemId/imgs/swap",
  isAuth,
  hasRole(["manager"]),
  [
    check("itemImg1Id")
      .not()
      .isEmpty()
      .withMessage("is required"),
    check("itemImg2Id")
      .not()
      .isEmpty()
      .withMessage("is required")
  ],
  itemController.swapItemImgs
);

router.patch(
  "/:itemId/remain",
  isAuth,
  hasRole(["manager"]),
  [
    check("remain")
      .isBoolean()
      .withMessage("must be boolean")
  ],
  itemController.setItemRemain
);

router.patch(
  "/:itemId/hidden",
  isAuth,
  hasRole(["manager"]),
  [
    check("hidden")
      .isBoolean()
      .withMessage("must be boolean")
  ],
  itemController.setItemHidden
);

router.delete("/:itemId", isAuth, hasRole(["manager"]), itemController.deleteItem);

router.delete(
  "/:itemId/imgs/:itemImgId",
  isAuth,
  hasRole(["manager"]),
  itemController.deleteItemImg
);

module.exports = router;
