const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const crypto = require("crypto");
const router = express.Router();
const { verifyToken } = require("../middleware/auth.middleware");
const { adminMiddleware } = require("../middleware/admin.middleware");
const {
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  obtenerProductos,
} = require("../controllers/inventario.controller");

const uploadDir = path.resolve(__dirname, "../../public/uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${crypto.randomBytes(6).toString("hex")}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

router.get("/", obtenerProductos);

router.post(
  "/upload",
  verifyToken,
  adminMiddleware,
  upload.single("image"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No se recibio ninguna imagen" });
    }

    res.json({
      filename: req.file.filename,
      imageUrl: `/uploads/${req.file.filename}`,
    });
  },
);
router.post("/", verifyToken, adminMiddleware, crearProducto);
router.put("/:id", verifyToken, adminMiddleware, actualizarProducto);
router.delete("/:id", verifyToken, adminMiddleware, eliminarProducto);

module.exports = router;
