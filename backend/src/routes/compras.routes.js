const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth.middleware");
const {
  registrarCompraProductos,
} = require("../controllers/compras.controller");

router.post("/", verifyToken, registrarCompraProductos);

module.exports = router;
