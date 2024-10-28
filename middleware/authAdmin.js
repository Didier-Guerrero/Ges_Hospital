module.exports = (req, res, next) => {
  if (!req.session.userId || req.session.userRole !== "admin") {
    return res
      .status(403)
      .send("Acceso denegado: Solo administradores pueden registrar usuarios.");
  }
  next();
};
