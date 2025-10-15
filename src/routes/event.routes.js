const express = require("express");
const { createEvent, getEvent } = require("../controllers/event.controller");

const router = express.Router();

router.post("/", createEvent);

router.get("/:id", getEvent);

module.exports = router;
