const express = require("express");
const {
  createEvent,
  getEvent,
  registerEvent,
} = require("../controllers/event.controller");

const router = express.Router();

router.post("/", createEvent);

router.post("/register", registerEvent);

router.get("/:id", getEvent);

module.exports = router;
