const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const register = async (req, res) => {
  const {
    email,
    contrasenia,
    nombre,
    domicilio,
    aceptaTerminos,
    aceptaPrivacidad,
  } = req.body;
  const cleanEmail = typeof email === "string" ? email.trim() : "";
  const cleanNombre = typeof nombre === "string" ? nombre.trim() : "";
  const cleanDomicilio = typeof domicilio === "string" ? domicilio.trim() : "";

  if (!cleanEmail || !contrasenia || !cleanNombre || !cleanDomicilio) {
    return res
      .status(400)
      .json({
        error: "Email, contraseña, nombre y domicilio son obligatorios",
      });
  }

  if (!isValidEmail(cleanEmail)) {
    return res.status(400).json({ error: "Ingresa un email valido" });
  }

  if (contrasenia.length < 6) {
    return res
      .status(400)
      .json({ error: "La contraseña debe tener al menos 6 caracteres" });
  }

  if (aceptaTerminos !== true || aceptaPrivacidad !== true) {
    return res
      .status(400)
      .json({ error: "Debes aceptar los terminos y el aviso de privacidad" });
  }

  const hashedPassword = await bcrypt.hash(contrasenia, 10);
  const userRole = "usuario";

  const sql =
    "INSERT INTO usuarios (email, contrasenia, nombre, domicilio, rol) VALUES (?, ?, ?, ?, ?)";
  db.query(
    sql,
    [cleanEmail, hashedPassword, cleanNombre, cleanDomicilio, userRole],
    (error, resultados) => {
      if (error) {
        if (error.code === "ER_DUP_ENTRY") {
          return res.status(409).json({ error: "El email ya esta en uso" });
        }

        return res.status(400).json({ error: error.message });
      }

      const token = jwt.sign(
        { id: resultados.insertId, email: cleanEmail, rol: userRole },
        process.env.JWT_SECRET,
        { expiresIn: "24h" },
      );

      res.status(201).json({
        mensaje: "Usuario registrado exitosamente",
        token,
        usuario: {
          id: resultados.insertId,
          email: cleanEmail,
          nombre: cleanNombre,
          domicilio: cleanDomicilio,
          rol: userRole,
        },
      });
    },
  );
};

const login = async (req, res) => {
  const { email, contrasenia } = req.body;
  const cleanEmail = typeof email === "string" ? email.trim() : "";

  if (!cleanEmail || !contrasenia) {
    return res
      .status(400)
      .json({ error: "Email y contraseña son obligatorios" });
  }

  const sql = "SELECT * FROM usuarios WHERE email = ?";
  db.query(sql, [cleanEmail], async (error, resultados) => {
    if (error) {
      return res.status(500).json({ error: "No se pudo verificar el usuario" });
    }

    if (resultados.length === 0) {
      return res.status(404).json({ error: "El usuario no existe" });
    }

    const usuario = resultados[0];
    const validPassword = await bcrypt.compare(
      contrasenia,
      usuario.contrasenia,
    );

    if (!validPassword) {
      return res.status(401).json({ error: "La contraseña es incorrecta" });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.json({
      mensaje: "Login exitoso",
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        domicilio: usuario.domicilio,
        rol: usuario.rol,
      },
    });
  });
};

module.exports = { register, login };
