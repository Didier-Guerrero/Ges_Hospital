const Session = require("../models/Session");
const Case = require("../models/Case");
const ExamModel = require("../models/Exam");

exports.showCreateSessionForm = async (req, res) => {
  try {
    const { id } = req.params; // ID del caso médico

    // Buscar el caso médico por ID
    const { data: caso, error } = await Case.findById(id);
    if (error || !caso) throw new Error("Caso médico no encontrado");

    // Renderizar el formulario para crear la sesión
    res.render("sessions/new", { caseId: id, caso }); // Asegúrate de pasar `caseId`
  } catch (error) {
    console.error("Error al cargar el formulario de sesión:", error.message);
    res.status(500).render("errors/500", {
      message: "Error al cargar el formulario de sesión",
    });
  }
};

exports.createSession = async (req, res) => {
  try {
    const { id } = req.params; // ID del caso médico
    const { evolucion, tratamiento, observaciones, exito } = req.body; // Asegúrate de obtener todos los campos

    // Crear la sesión asociada al caso médico
    await Session.create({
      case_id: id,
      evolucion,
      tratamiento,
      observaciones,
      exito: exito === "true", // Convertir a booleano
      fecha: new Date(), // Fecha actual
    });

    // Redirigir de vuelta a la página de detalles del caso médico
    res.redirect(`/api/cases/${id}`);
  } catch (error) {
    console.error("Error al crear la sesión:", error.message);
    res.status(500).render("errors/500", {
      message: "Error al crear la sesión",
    });
  }
};

exports.showSessionDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: sesion, error } = await Session.findById(id);

    if (error || !sesion) {
      return res.status(404).render("errors/404", {
        message: "Sesión no encontrada.",
      });
    }

    const { data: caso, error: caseError } = await Case.findById(
      sesion.case_id
    );
    if (caseError || !caso) {
      return res.status(404).render("errors/404", {
        message: "Caso asociado no encontrado.",
      });
    }

    // Obtener los exámenes asociados a esta sesión
    const { data: examenes, error: examenesError } =
      await ExamModel.findBySessionId(id);
    if (examenesError) {
      console.error(
        `Error al obtener exámenes de la sesión ${id}:`,
        examenesError.message
      );
      throw new Error("Error al obtener los exámenes asociados a la sesión.");
    }

    res.render("sessions/details", { sesion, caso, examenes });
  } catch (error) {
    console.error("Error al mostrar los detalles de la sesión:", error.message);
    res.status(500).render("errors/500", {
      message: "Error al mostrar los detalles de la sesión.",
    });
  }
};

exports.showEditSessionForm = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: sesion, error } = await Session.findById(id);

    if (error || !sesion) {
      return res.status(404).render("errors/404", {
        message: "Sesión no encontrada.",
      });
    }

    res.render("sessions/edit", { sesion });
  } catch (error) {
    console.error("Error al cargar el formulario de edición:", error.message);
    res.status(500).render("errors/500", {
      message: "Error al cargar el formulario de edición.",
    });
  }
};

exports.updateSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { evolucion, tratamiento, observaciones, exito } = req.body;

    const { error } = await Session.update(id, {
      evolucion,
      tratamiento,
      observaciones,
      exito: exito === "true",
    });

    if (error) throw new Error("Error al actualizar la sesión.");

    res.redirect(`/api/sessions/${id}`);
  } catch (error) {
    console.error("Error al actualizar la sesión:", error.message);
    res.status(500).render("errors/500", {
      message: "Error al actualizar la sesión.",
    });
  }
};

exports.deleteSession = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await Session.delete(id);
    if (error) throw new Error("Error al eliminar la sesión.");

    res.redirect(`/api/cases/${req.query.caseId}`);
  } catch (error) {
    console.error("Error al eliminar la sesión:", error.message);
    res.status(500).render("errors/500", {
      message: "Error al eliminar la sesión.",
    });
  }
};
