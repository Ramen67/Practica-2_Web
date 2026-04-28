const express = require("express");
const router = express.Router();
const {
  createOrder,
  captureOrder,
} = require("../controllers/paypal.controller");

router.post("/create-order", createOrder);
router.post("/capturar-order", captureOrder);

module.exports = router;
