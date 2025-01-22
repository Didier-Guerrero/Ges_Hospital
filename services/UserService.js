const User = require('../models/User');
const bcrypt = require('bcryptjs');

class UserService {

  // Crear un nuevo usuario
  async createUser({ nombre, email, password, role }) {
    try {
      const encryptedPassword = await bcrypt.hash(password, 10);
      const { data, error } = await User.create({
        nombre,
        email,
        password: encryptedPassword,
        role,
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data;
    } catch (error) {
      throw new Error("Error al crear el usuario: " + error.message);
    }
  }

  // Login de usuario
  async login({ email, password }) {
    try {
      const { data: user, error } = await User.findByEmail(email);
      if (error || !user) {
        throw new Error("Credenciales inválidas");
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new Error("Credenciales inválidas");
      }

      return user;
    } catch (error) {
      throw new Error("Error al iniciar sesión: " + error.message);
    }
  }

  // Cerrar sesión
  async logout(req) {
    try {
      req.session.destroy((err) => {
        if (err) {
          throw new Error("Error al cerrar sesión");
        }
      });
    } catch (error) {
      throw new Error("Error al cerrar sesión: " + error.message);
    }
  }

}

module.exports = new UserService();
