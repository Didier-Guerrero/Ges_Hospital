const express = require("express");
const router = express.Router();
const caseController = require("../controllers/caseController");
const auth = require("../middleware/auth"); // Importa el middleware de autenticación

// Ruta para mostrar el formulario de creación de casos médicos (antes de /:id)
router.get("/new", auth, caseController.showCreateCaseForm);

// Rutas para CRUD de casos médicos
router.get("/", auth, caseController.getCases);
router.get("/:id", auth, caseController.getCaseById); // Ver detalles
router.get("/:id/edit", auth, caseController.showEditCaseForm); // Formulario de edición
router.put("/:id", auth, caseController.updateCase); // Actualizar caso
router.delete("/:id", auth, caseController.deleteCase); // Eliminar caso

// Ruta para comparación de casos
router.post("/compare", auth, caseController.compareCases);

module.exports = router;
