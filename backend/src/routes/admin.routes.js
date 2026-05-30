const express = require("express");
const { verifyToken } = require("../middleware/auth.middleware");
const { adminMiddleware } = require("../middleware/admin.middleware");
const {
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  obtenerProductos,
} = require("../controllers/inventario.controller");

const router = express.Router();

router.get("/", verifyToken, adminMiddleware, obtenerProductos);
router.post("/", verifyToken, adminMiddleware, crearProducto);
router.put("/:id", verifyToken, adminMiddleware, actualizarProducto);
router.delete("/:id", verifyToken, adminMiddleware, eliminarProducto);

module.exports = router;
