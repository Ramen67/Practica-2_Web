const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      mensaje: "usuario no autenticado",
    });
  }
  if (req.user.rol !== "admin") {
    return res.status(403).json({
      mensaje: "Acceso denegado. Solo administradores.",
    });
  }
  next();
};

module.exports = { adminMiddleware };
