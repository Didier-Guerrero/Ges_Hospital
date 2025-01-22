const ExamService = require('../services/ExamService');

exports.showCreateExamForm = async (req, res) => {
  try {
    const { sessionId } = req.query;

    // Buscar la sesión asociada
    const sesion = await ExamService.getSessionDetails(sessionId);
    res.render("exams/new", { sessionId, sesion });
  } catch (error) {
    console.error("Error al cargar el formulario de examen:", error.message);
    res.status(500).render("errors/500", {
      message: "Error al cargar el formulario de examen.",
    });
  }
};

exports.createExam = async (req, res) => {
  try {
    const { sessionId, caseId, type, requested_date, completion_date, result, status, observations } = req.body;

    // Llamar al servicio para crear el examen
    await ExamService.createExam({
      sessionId,
      caseId,
      type,
      requested_date,
      completion_date,
      result,
      status,
      observations
    });

    res.redirect(`/api/sessions/${sessionId}`);
  } catch (error) {
    console.error("Error al crear el examen:", error.message);
    res.status(500).render("errors/500", {
      message: "Error al crear el examen.",
    });
  }
};

exports.showExamDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // Llamar al servicio para obtener los detalles del examen
    const examen = await ExamService.getExamById(id);

    res.render("exams/details", { examen });
  } catch (error) {
    console.error("Error al mostrar los detalles del examen:", error.message);
    res.status(500).render("errors/500", {
      message: "Error al mostrar los detalles del examen.",
    });
  }
};

exports.showEditExamForm = async (req, res) => {
  try {
    const { id } = req.params;

    // Llamar al servicio para obtener los detalles del examen
    const examen = await ExamService.getExamById(id);

    if (examen.requested_date) {
      examen.requested_date = new Date(examen.requested_date);
    }
    if (examen.completion_date) {
      examen.completion_date = new Date(examen.completion_date);
    }

    res.render("exams/edit", { examen });
  } catch (error) {
    console.error("Error al buscar examen:", error.message);
    res.status(500).render("errors/500", {
      message: "Error al buscar el examen.",
    });
  }
};

exports.updateExam = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, requested_date, completion_date, status, result, observations } = req.body;

    // Llamar al servicio para actualizar el examen
    await ExamService.updateExam(id, {
      type,
      requested_date,
      completion_date,
      status,
      result,
      observations
    });

    res.redirect(`/api/exams/${id}`);
  } catch (error) {
    console.error("Error al actualizar el examen:", error.message);
    res.status(500).render("errors/500", {
      message: "Error al actualizar el examen.",
    });
  }
};

exports.deleteExam = async (req, res) => {
  try {
    const { id } = req.params;

    // Llamar al servicio para eliminar el examen
    await ExamService.deleteExam(id);

    res.redirect(`/api/sessions/${req.query.sessionId}`);
  } catch (error) {
    console.error("Error al eliminar el examen:", error.message);
    res.status(500).render("errors/500", {
      message: "Error al eliminar el examen.",
    });
  }
};
