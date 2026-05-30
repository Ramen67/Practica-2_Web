const db = require("../config/db");

const registrarCompra = (userId, elementosComprados, total, callback) => {
  const sql =
    "INSERT INTO historial (usuario_id, elementos_comprados, total) VALUES (?, ?, ?)";
  db.query(sql, [userId, elementosComprados, total], (error, resultados) => {
    if (error) {
      return callback(error, null);
    }
    callback(null, resultados);
  });
};

const obtenerHistorialUsuario = (userId, callback) => {
  const sql =
    "SELECT * FROM historial WHERE usuario_id = ? ORDER BY fecha DESC";
  db.query(sql, [userId], (error, resultados) => {
    if (error) {
      return callback(error, null);
    }
    callback(null, resultados);
  });
};

const obtenerTodoHistorial = (callback) => {
  const sql = "SELECT * FROM historial ORDER BY fecha DESC";
  db.query(sql, (error, resultados) => {
    if (error) {
      return callback(error, null);
    }
    callback(null, resultados);
  });
};

module.exports = {
  registrarCompra,
  obtenerHistorialUsuario,
  obtenerTodoHistorial,
};
