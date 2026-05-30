const { registrarCompra } = require("../services/historial.service");
const db = require("../config/db");
const { enviarReciboCompra } = require("../services/brevo.service");
const { generarReciboXml } = require("../services/recibo.service");

const obtenerUsuario = (userId) =>
  new Promise((resolve, reject) => {
    const sql = "SELECT id, email, nombre, domicilio FROM usuarios WHERE id = ?";

    db.query(sql, [userId], (error, resultados) => {
      if (error) {
        reject(error);
        return;
      }

      if (resultados.length === 0) {
        reject(new Error("Usuario no encontrado"));
        return;
      }

      resolve(resultados[0]);
    });
  });

const registrarCompraAsync = (userId, elementosComprados, total) =>
  new Promise((resolve, reject) => {
    registrarCompra(userId, elementosComprados, total, (error, resultados) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(resultados);
    });
  });

const registrarCompraProductos = async (req, res) => {
  const userId = req.user.id;
  const { productos, subtotal, iva, total } = req.body;

  if (!Array.isArray(productos) || productos.length === 0) {
    return res.status(400).json({ error: "La compra debe incluir productos" });
  }

  const elementosComprados = JSON.stringify(productos);

  try {
    const usuario = await obtenerUsuario(userId);
    const resultados = await registrarCompraAsync(userId, elementosComprados, total);
    const recibo = generarReciboXml({ productos, subtotal, iva, total, usuario });
    let correoEnviado = true;

    try {
      await enviarReciboCompra({ usuario, recibo });
    } catch (emailError) {
      correoEnviado = false;
      console.error("Error enviando recibo por correo:", emailError.message);
    }

    return res.status(201).json({
      mensaje: correoEnviado
        ? "Compra registrada exitosamente. El recibo fue enviado por correo."
        : "Compra registrada exitosamente, pero no se pudo enviar el recibo por correo.",
      correoEnviado,
      recibo: {
        folio: recibo.folio,
        filename: recibo.filename,
      },
      compra: {
        id: resultados.insertId,
        usuario_id: userId,
        elementos_comprados: productos,
        total: total,
      },
    });
  } catch (error) {
      return res.status(400).json({ error: error.message });
  }
};

module.exports = { registrarCompraProductos };
