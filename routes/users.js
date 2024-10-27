const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authAdmin = require("../middleware/authAdmin"); // Importa el middleware de admin

// Ruta para mostrar el formulario de inicio de sesión
router.get("/login", (req, res) => {
  res.render("users/login"); // Renderiza la vista login.ejs
});

// Ruta para mostrar el formulario de registro (protegida para admin)
router.get("/register", authAdmin, (req, res) => {
  res.render("users/register"); // Renderiza la vista register.ejs
});

// Ruta para procesar el registro de usuarios (protegida para admin)
router.post("/register", authAdmin, userController.createUser);

// Rutas para inicio de sesión y cierre de sesión
router.post("/login", userController.login);
router.get("/logout", userController.logout);
module.exports = router;
