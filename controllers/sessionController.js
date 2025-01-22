const SessionService = require('../services/SessionService');
const Case = require('../models/Case');
const Session = require('../models/Session');

exports.showCreateSessionForm = async (req, res) => {
  try {
    const { id } = req.params; // ID del caso médico

    // Buscar el caso médico por ID
    const { data: caso, error } = await Case.findById(id);
    if (error || !caso) {
      return res.status(404).render("errors/404", { message: "Caso médico no encontrado" });
    }

    // Renderizar el formulario para crear la sesión
    res.render("sessions/new", { caseId: id, caso });
  } catch (error) {
    console.error("Error al cargar el formulario de sesión:", error.message);
    res.status(500).render("errors/500", { message: "Error al cargar el formulario de sesión" });
  }
};

exports.createSession = async (req, res) => {
  try {
    const { id } = req.params; // ID del caso médico
    const { evolucion, tratamiento, observaciones, exito } = req.body;

    // Llamar al servicio para crear la sesión
    await SessionService.createSession(id, { evolucion, tratamiento, observaciones, exito });

    // Redirigir de vuelta a la página de detalles del caso médico
    res.redirect(`/api/cases/${id}`);
  } catch (error) {
    console.error("Error al crear la sesión:", error.message);
    res.status(500).render("errors/500", { message: "Error al crear la sesión" });
  }
};

exports.showSessionDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // Llamar al servicio para obtener los detalles de la sesión
    const { sesion, caso, examenes } = await SessionService.getSessionDetails(id);

    res.render("sessions/details", { sesion, caso, examenes });
  } catch (error) {
    console.error("Error al mostrar los detalles de la sesión:", error.message);
    res.status(500).render("errors/500", { message: "Error al mostrar los detalles de la sesión" });
  }
};

exports.showEditSessionForm = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar la sesión por ID
    const { data: sesion, error } = await Session.findById(id);
    if (error || !sesion) {
      return res.status(404).render("errors/404", { message: "Sesión no encontrada." });
    }

    res.render("sessions/edit", { sesion });
  } catch (error) {
    console.error("Error al cargar el formulario de edición:", error.message);
    res.status(500).render("errors/500", { message: "Error al cargar el formulario de edición" });
  }
};

exports.updateSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { evolucion, tratamiento, observaciones, exito } = req.body;

    // Llamar al servicio para actualizar la sesión
    await SessionService.updateSession(id, { evolucion, tratamiento, observaciones, exito });

    // Redirigir al caso médico relacionado
    const { data: sesion, error } = await Session.findById(id);
    if (error || !sesion) {
      return res.status(404).render("errors/404", { message: "Sesión no encontrada." });
    }

    res.redirect(`/api/cases/${sesion.case_id}`);
  } catch (error) {
    console.error("Error al actualizar la sesión:", error.message);
    res.status(500).render("errors/500", { message: "Error al actualizar la sesión" });
  }
};

exports.deleteSession = async (req, res) => {
  try {
    const { id } = req.params;

    // Llamar al servicio para eliminar la sesión
    await SessionService.deleteSession(id);

    // Redirigir al caso médico relacionado
    const { data: sesion, error } = await Session.findById(id);
    if (error || !sesion) {
      return res.status(404).render("errors/404", { message: "Sesión no encontrada." });
    }

    res.redirect(`/api/cases/${sesion.case_id}`);
  } catch (error) {
    console.error("Error al eliminar la sesión:", error.message);
    res.status(500).render("errors/500", { message: "Error al eliminar la sesión" });
  }
};
