const db = require("../config/db");

const validarProducto = ({ nombre, descripcion, precio, stock, imageUrl, category, detalles }) => {
  if (!String(nombre ?? "").trim()) return "El nombre es obligatorio";
  if (!String(descripcion ?? "").trim()) return "La descripcion es obligatoria";
  if (!String(category ?? "").trim()) return "La categoria es obligatoria";
  if (!String(detalles ?? "").trim()) return "Los detalles son obligatorios";
  if (!String(imageUrl ?? "").trim()) return "La imagen es obligatoria";

  const precioNumero = Number(precio);
  const stockNumero = Number(stock);

  if (!Number.isFinite(precioNumero) || precioNumero <= 0) {
    return "El precio debe ser mayor a 0";
  }

  if (!Number.isInteger(stockNumero) || stockNumero < 0) {
    return "El stock debe ser un numero entero mayor o igual a 0";
  }

  return null;
};

const crearProducto = (req, res) => {
  const { nombre, descripcion, precio, stock, imageUrl, category, detalles, inStock } =
    req.body;
  const errorValidacion = validarProducto(req.body);

  if (errorValidacion) {
    return res.status(400).json({ error: errorValidacion });
  }

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
  const errorValidacion = validarProducto(req.body);

  if (errorValidacion) {
    return res.status(400).json({ error: errorValidacion });
  }

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

const cambiarEstadoProducto = (req, res) => {
  const { id } = req.params;
  const { isEnabled } = req.body;

  const sql = "UPDATE productos SET isEnabled = ? WHERE id = ?";
  db.query(sql, [isEnabled ? 1 : 0, id], (error) => {
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      mensaje: isEnabled ? "Producto activado exitosamente" : "Producto desactivado exitosamente",
    });
  });
};

const obtenerProductos = (req, res) => {
  const sql = "SELECT * FROM productos ORDER BY id ASC";
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
  cambiarEstadoProducto,
  obtenerProductos,
};
