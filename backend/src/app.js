const express = require("express");
const cors = require("cors");
const path = require("path");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const productosRoutes = require("./routes/productos.routes");
const inventarioRoutes = require("./routes/inventario.routes");
const comprasRoutes = require("./routes/compras.routes");
const paypalRoutes = require("./routes/paypal.routes");
const adminRoutes = require("./routes/admin.routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(
  "/uploads",
  express.static(path.resolve(__dirname, "../public/uploads")),
);

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/productos", productosRoutes);
app.use("/api/inventario", inventarioRoutes);
app.use("/api/compras", comprasRoutes);
app.use("/api/paypal", paypalRoutes);
app.use("/api/admin", adminRoutes);

module.exports = app;
