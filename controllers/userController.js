const User = require("../models/User");
const bcrypt = require("bcryptjs");

exports.createUser = async (req, res) => {
  const { nombre, email, password, role } = req.body;
  const { data, error } = await User.create({ nombre, email, password, role });
  if (error) return res.status(500).json({ message: error.message });
  res.redirect("/api/users/login");
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const { data: user, error } = await User.findByEmail(email);
  if (error || !user)
    return res.status(400).json({ message: "Credenciales inválidas" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch)
    return res.status(400).json({ message: "Credenciales inválidas" });

  req.session.userId = user.id;
  res.redirect("/api/cases");
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const { data: user, error } = await User.findByEmail(email);
  if (error || !user)
    return res.status(400).json({ message: "Credenciales inválidas" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch)
    return res.status(400).json({ message: "Credenciales inválidas" });

  req.session.userId = user.id;
  req.session.userRole = user.role;
  res.redirect("/api/cases");
};

exports.createUser = async (req, res) => {
  if (req.session.userRole !== "admin") {
    return res
      .status(403)
      .send("Acceso denegado: Solo administradores pueden registrar usuarios.");
  }

  const { nombre, email, password, role } = req.body;
  const { data, error } = await User.create({ nombre, email, password, role });
  if (error) return res.status(500).json({ message: error.message });
  res.redirect("/api/users/login");
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: "Error al cerrar sesión" });
    res.redirect("/api/users/login");
  });
};
