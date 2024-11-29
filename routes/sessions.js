const express = require("express");
const router = express.Router();
const sessionController = require("../controllers/sessionController");

// Formulario para crear una nueva sesión
router.get("/new/:id", sessionController.showCreateSessionForm);
router.post("/create", sessionController.createSession);
router.post("/:id", sessionController.createSession);
// Crear una nueva sesión
router.post("/", sessionController.createSession);

// Mostrar detalles de una sesión
router.get("/:id", sessionController.showSessionDetails);

// Mostrar formulario de edición de sesión
router.get("/:id/edit", sessionController.showEditSessionForm);

// Actualizar una sesión
router.put("/:id", sessionController.updateSession);

// Eliminar una sesión
router.delete("/:id", sessionController.deleteSession);

module.exports = router;
