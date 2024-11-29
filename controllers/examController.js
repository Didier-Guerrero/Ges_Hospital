const Exam = require("../models/Exam");
const Session = require("../models/Session");

// Mostrar formulario para solicitar un nuevo examen
exports.showCreateExamForm = async (req, res) => {
  try {
    const { sessionId } = req.query;

    // Buscar la sesión asociada
    const { data: sesion, error } = await Session.findById(sessionId);
    if (error || !sesion) {
      return res.status(404).render("errors/404", {
        message: "Sesión no encontrada.",
      });
    }

    res.render("exams/new", { sessionId, sesion });
  } catch (error) {
    console.error("Error al cargar el formulario de examen:", error.message);
    res.status(500).render("errors/500", {
      message: "Error al cargar el formulario de examen.",
    });
  }
};

// Crear un nuevo examen
exports.createExam = async (req, res) => {
  try {
    const {
      sessionId,
      caseId,
      type,
      requested_date,
      completion_date,
      result,
      status,
      observations,
    } = req.body;

    // Crear un nuevo examen
    const { error } = await Exam.create({
      session_id: sessionId,
      case_id: caseId,
      type,
      requested_date: new Date(requested_date),
      completion_date: completion_date ? new Date(completion_date) : null,
      result: result || null,
      status,
      observations: observations || null,
    });

    if (error) throw new Error("Error al crear el examen.");

    res.redirect(`/api/sessions/${sessionId}`);
  } catch (error) {
    console.error("Error al crear el examen:", error.message);
    res.status(500).render("errors/500", {
      message: "Error al crear el examen.",
    });
  }
};
// Ver detalles de un examen
exports.showExamDetails = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("ID recibido para detalles del examen:", id);

    const examen = await Exam.findById(id);

    if (!examen) {
      console.error("Examen no encontrado para ID:", id);
      return res.status(404).render("errors/404", {
        message: "Examen no encontrado.",
      });
    }

    console.log("Examen encontrado:", examen);
    res.render("exams/details", { examen });
  } catch (error) {
    console.error("Error al mostrar los detalles del examen:", error.message);
    res.status(500).render("errors/500", {
      message: "Error al mostrar los detalles del examen.",
    });
  }
};

// Mostrar formulario de edición de un examen
exports.showEditExamForm = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("ID recibido para edit:", id);
    const examen = await Exam.findById(id);
    console.log("Datos obtenidos luego de metodo en modelo:", examen);

    if (!examen) {
      return res.status(404).render("errors/404", {
        message: "Examen no encontrado.",
      });
    }
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

// Actualizar un examen
exports.updateExam = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      type,
      requested_date,
      completion_date,
      status,
      result,
      observations,
    } = req.body;

    // Actualizar el examen con los datos proporcionados
    const updatedExam = await Exam.update(id, {
      type,
      requested_date: new Date(requested_date),
      completion_date: completion_date ? new Date(completion_date) : null,
      status,
      result,
      observations,
    });

    console.log("Examen actualizado:", updatedExam);

    res.redirect(`/api/exams/${id}`);
  } catch (error) {
    console.error("Error al actualizar el examen:", error.message);
    res.status(500).render("errors/500", {
      message: "Error al actualizar el examen.",
    });
  }
};

// Eliminar un examen
exports.deleteExam = async (req, res) => {
  try {
    const { id } = req.params;

    // Eliminar el examen
    const examenEliminado = await Exam.delete(id);

    if (!examenEliminado) {
      return res.status(404).render("errors/404", {
        message: "Examen no encontrado para eliminar.",
      });
    }

    res.redirect(`/api/sessions/${req.query.sessionId}`);
  } catch (error) {
    console.error("Error al eliminar el examen:", error.message);
    res.status(500).render("errors/500", {
      message: "Error al eliminar el examen.",
    });
  }
};
