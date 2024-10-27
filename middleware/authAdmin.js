module.exports = (req, res, next) => {
  if (!req.session.userId || req.session.userRole !== "admin") {
    // Redirige al inicio de sesión si no está autenticado o no es admin
    return res
      .status(403)
      .send("Acceso denegado: Solo administradores pueden registrar usuarios.");
  }
  next();
};
