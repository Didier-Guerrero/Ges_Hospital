const UserService = require('../services/UserService');

exports.createUser = async (req, res) => {
  try {
    if (req.session.userRole !== 'admin') {
      return res.status(403).json({ message: "Acceso denegado: Solo administradores pueden registrar usuarios." });
    }

    const { nombre, email, password, role } = req.body;
    const user = await UserService.createUser({ nombre, email, password, role });

    res.redirect("/api/users/login");
  } catch (error) {
    console.error("Error al crear el usuario:", error.message);
    res.status(500).json({ message: `Error al crear el usuario: ${error.message}` });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserService.login({ email, password });

    req.session.userId = user.id;
    req.session.userRole = user.role;

    res.redirect("/api/cases");
  } catch (error) {
    console.error("Error al iniciar sesión:", error.message);
    res.status(400).json({ message: "Credenciales inválidas" });
  }
};

exports.logout = (req, res) => {
  try {
    UserService.logout(req);
    res.redirect("/api/users/login");
  } catch (error) {
    console.error("Error al cerrar sesión:", error.message);
    res.status(500).json({ message: "Error al cerrar sesión" });
  }
};
