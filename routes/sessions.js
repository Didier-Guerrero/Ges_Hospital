const express = require("express");
const router = express.Router();
const sessionController = require("../controllers/sessionController");

// Rutas para sesiones
router.get("/new/:id", sessionController.showCreateSessionForm); // Formulario para crear sesión
router.post("/create", sessionController.createSession);
router.post("/:id", sessionController.createSession); // Crear una nueva sesión

router.get("/:id", sessionController.showSessionDetails);

// Mostrar formulario de edición de sesión
router.get("/:id/edit", sessionController.showEditSessionForm);

// Actualizar sesión
router.post("/:id?_method=PUT", sessionController.updateSession);

// Eliminar sesión
router.post("/:id?_method=DELETE", sessionController.deleteSession);

module.exports = router;
