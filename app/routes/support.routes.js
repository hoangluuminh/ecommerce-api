const express = require("express");

const router = express.Router();
const { check, query } = require("express-validator");

const { isAuth, hasRole } = require("../middlewares/auth.middleware");
const supportController = require("../controllers/support.controller");

const supportTicketInfoChecks = [
  check("supportTypeId")
    .not()
    .isEmpty()
    .withMessage("Required."),
  check("orderId").optional(),
  check("note")
    .not()
    .isEmpty()
    .withMessage("Required.")
];

// GET: List of support tickets
router.get(
  "/",
  isAuth,
  hasRole(["support"]),
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
      .matches(/^(id|supportTypeId|support|customer|statusId|orderId|createdAt|updatedAt)$/)
      .withMessage("value is not valid"),
    query("sortDesc").toBoolean(),
    query("supportTypeId").optional(),
    query("support").optional(),
    query("customer").optional(),
    query("statusId").optional()
  ],
  supportController.getSupportTickets
);

// GET: Support Types List
router.get("/types", supportController.getSupportTypes);

// GET: Support Ticket Statuses List
router.get("/statuses", supportController.getSupportTicketStatuses);

// GET: Support Ticket detail
router.get("/:supportTicketId", isAuth, hasRole(["support"]), supportController.getSupportTicket);

// POST: Submit Support Ticket
router.post(
  "/",
  isAuth,
  hasRole(["user"]),
  supportTicketInfoChecks,
  supportController.addSupportTicket
);

// PATCH: Update Support Ticket's status
router.patch(
  "/:supportTicketId/status",
  isAuth,
  hasRole(["support"]),
  [
    check("statusId")
      .not()
      .isEmpty()
      .withMessage("Required.")
  ],
  supportController.updateSupportTicketStatus
);

// DELETE: Delete Support
router.delete(
  "/:supportTicketId",
  isAuth,
  hasRole(["support"]),
  supportController.deleteSupportTicket
);

module.exports = router;
