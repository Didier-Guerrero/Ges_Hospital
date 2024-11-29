const express = require("express");
const router = express.Router();
const examController = require("../controllers/examController");

// Mostrar formulario para solicitar un nuevo examen
router.get("/new", examController.showCreateExamForm);

// Crear un nuevo examen
router.post("/new", examController.createExam);

// Ver detalles de un examen
router.get("/:id", examController.showExamDetails);

// Mostrar formulario de edición de un examen
router.get("/:id/edit", examController.showEditExamForm);

// Actualizar un examen
router.put("/:id", examController.updateExam);

// Eliminar un examen
router.delete("/:id", examController.deleteExam);

module.exports = router;
