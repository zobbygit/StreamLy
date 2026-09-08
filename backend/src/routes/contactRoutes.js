const express = require("express");
const { createContactMessage } = require("../controllers/contactController.js");

const router = express.Router();

router.post("/", createContactMessage);

module.exports = router;