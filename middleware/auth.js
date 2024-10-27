module.exports = (req, res, next) => {
  if (!req.session.userId) {
    // Si no hay un userId en la sesión, redirige al login
    return res.redirect("/api/users/login");
  }
  next();
};
