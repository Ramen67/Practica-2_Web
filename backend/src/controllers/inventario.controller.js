const db = require("../config/db");

const crearProducto = (req, res) => {
  const { nombre, descripcion, precio, stock, imageUrl, category, detalles, inStock } =
    req.body;

  const sql =
    "INSERT INTO productos (name, description, price, stock, imageUrl, category, detalles, inStock, isEnabled) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
  db.query(
    sql,
    [nombre, descripcion, precio, stock, imageUrl, category, detalles, inStock, 1],
    (error, resultados) => {
      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.status(201).json({
        mensaje: "Producto creado exitosamente",
        producto: {
          id: resultados.insertId,
          nombre,
          descripcion,
          precio,
          stock,
          imageUrl,
          category,
          detalles,
          inStock,
          isEnabled: 1,
        },
      });
    },
  );
};

const actualizarProducto = (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, precio, stock, imageUrl, category, detalles, inStock } =
    req.body;

  const sql =
    "UPDATE productos SET name = ?, description = ?, price = ?, stock = ?, imageUrl = ?, category = ?, detalles = ?, inStock = ? WHERE id = ?";
  db.query(
    sql,
    [nombre, descripcion, precio, stock, imageUrl, category, detalles, inStock, id],
    (error) => {
      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.json({ mensaje: "Producto actualizado exitosamente" });
    },
  );
};

const eliminarProducto = (req, res) => {
  const { id } = req.params;

  const sql = "UPDATE productos SET isEnabled = 0 WHERE id = ?";
  db.query(sql, [id], (error) => {
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ mensaje: "Producto desactivado exitosamente" });
  });
};

const obtenerProductos = (req, res) => {
  const sql = "SELECT * FROM productos WHERE isEnabled = 1 OR isEnabled IS NULL";
  db.query(sql, (error, resultados) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(resultados);
  });
};

module.exports = {
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  obtenerProductos,
};
