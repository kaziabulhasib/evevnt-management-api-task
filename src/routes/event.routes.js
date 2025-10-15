const express = require("express");
const {
  createEvent,
  getEvent,
  registerEvent,
  cancelRegistration,
  getUpcomingEvents,
} = require("../controllers/event.controller");

const router = express.Router();

router.post("/", createEvent);

router.post("/register", registerEvent);
router.post("/cancel", cancelRegistration);

router.get("/upcoming", getUpcomingEvents);

router.get("/:id", getEvent);

module.exports = router;
