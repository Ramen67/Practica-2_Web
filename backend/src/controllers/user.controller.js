const db = require("../config/db");

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const getProfile = (req, res) => {
  const userId = req.user.id;

  const sql = "SELECT id, email, nombre, domicilio, rol FROM usuarios WHERE id = ?";
  db.query(sql, [userId], (error, resultados) => {
    if (error || resultados.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(resultados[0]);
  });
};

const updateProfile = (req, res) => {
  const userId = req.user.id;
  const { nombre, email, domicilio } = req.body;
  const cleanNombre = typeof nombre === "string" ? nombre.trim() : "";
  const cleanEmail = typeof email === "string" ? email.trim() : "";
  const cleanDomicilio = typeof domicilio === "string" ? domicilio.trim() : "";

  if (!cleanNombre || !cleanEmail || !cleanDomicilio) {
    return res.status(400).json({ error: "Nombre, email y domicilio son obligatorios" });
  }

  if (!isValidEmail(cleanEmail)) {
    return res.status(400).json({ error: "Ingresa un email valido" });
  }

  const sql = "UPDATE usuarios SET nombre = ?, email = ?, domicilio = ? WHERE id = ?";
  db.query(sql, [cleanNombre, cleanEmail, cleanDomicilio, userId], (error) => {
    if (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ error: "El email ya está en uso" });
      }

      return res.status(400).json({ error: error.message });
    }

    const profileSql =
      "SELECT id, email, nombre, domicilio, rol FROM usuarios WHERE id = ?";
    db.query(profileSql, [userId], (profileError, resultados) => {
      if (profileError || resultados.length === 0) {
        return res
          .status(500)
          .json({ error: "No se pudo obtener el perfil actualizado" });
      }

      res.json({
        mensaje: "Perfil actualizado exitosamente",
        usuario: resultados[0],
      });
    });
  });
};

const getOrderHistory = (req, res) => {
  const userId = req.user.id;

  const sql =
    "SELECT * FROM historial WHERE usuario_id = ? ORDER BY fecha DESC";
  db.query(sql, [userId], (error, resultados) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(resultados);
  });
};

module.exports = { getProfile, updateProfile, getOrderHistory };
