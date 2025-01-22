const Case = require("../models/Case");
const User = require("../models/User");
const SessionModel = require("../models/Session");
const ExamModel = require("../models/Exam");
const CaseService = require("../services/CaseService");

exports.getCases = async (req, res) => {
  try {
    const { enfermedad } = req.query;
    let searchQuery = enfermedad || "";

    if (req.session.userRole === "paciente") {
      // Llamar al servicio para obtener los casos del paciente
      const cases = await CaseService.getCasesForPatient(req.session.userId);
      res.render("cases/index_patient", { cases });
    } else if (["medico", "admin"].includes(req.session.userRole)) {
      // Llamar al servicio para obtener los casos para médicos o administradores
      const { cases, searchResults } = await CaseService.getCasesForDoctorAdmin(enfermedad);
      res.render("cases/index_doctor_admin", {
        cases,
        searchResults,
        searchQuery,
        userRole: req.session.userRole,
      });
    } else {
      res.status(403).send("Acceso denegado");
    }
  } catch (error) {
    console.error("Error al obtener los casos:", error);
    res.status(500).json({ message: "Error al obtener las historias médicas" });
  }
};

exports.createCase = async (req, res) => {
  const {
    user_id,
    enfermedad,
    diagnostico,
    sintomas,
    tratamiento_inicial,
    duracion_tratamiento,
    fecha_inicio,
    fecha_final,
    uso_medicamento_dias,
  } = req.body;

  const doctorId = req.session.userId;

  try {
    // Llamamos al método estático de CaseService
    const result = await CaseService.createCase(
      user_id,
      doctorId,
      enfermedad,
      diagnostico,
      sintomas,
      tratamiento_inicial,
      duracion_tratamiento,
      fecha_inicio,
      fecha_final,
      uso_medicamento_dias
    );

    // Redirigir con el ID del caso creado
    res.redirect(`/api/cases/${result[0].id}/options`);
  } catch (error) {
    console.error("Error al crear el caso médico:", error.message);
    res.status(500).json({ message: `Error al crear el caso médico: ${error.message}` });
  }
};

exports.showOptions = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      console.error("El ID proporcionado no es válido:", id);
      return res
        .status(400)
        .json({ message: "El ID proporcionado no es válido." });
    }

    const { data: caso, error } = await Case.findById(id);

    if (error) {
      console.error(
        `Error en la consulta a Supabase para ID ${id}:`,
        error.message
      );
      throw new Error("Error en la base de datos");
    }

    // Depuración: verifica si no se encontró el caso
    if (!caso) {
      console.error(`Caso con ID ${id} no encontrado en la base de datos`);
      return res.status(404).json({ message: "Caso no encontrado" });
    }

    console.log(`Caso encontrado con ID ${id}:, caso`); // Depuración: muestra los datos encontrados

    // Renderiza la vista con los datos del caso
    res.render("cases/options", { caso });
  } catch (error) {
    console.error("Error al cargar las opciones del caso:", error.message);

    // Devuelve un error 500 con un mensaje más detallado para depuración
    res.status(500).json({
      message: `Error al cargar las opciones del caso: ${error.message}`,
    });
  }
};



exports.analyzeCase = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("ID recibido para análisis:", id); // Asegúrate de que el ID se pase correctamente

    const { caso, casosSimilares } = await CaseService.analyzeCaseById(id);
    res.render("cases/analyze", { caso, casosSimilares });

  } catch (error) {
    console.error("Error al analizar el caso:", error.message);
    res.status(500).json({ message: `Error al analizar el caso médico: ${error.message}` });
  }
};


exports.storeCase = async (req, res) => {
  try {
    res.redirect("/api/cases");
  } catch (error) {
    console.error("Error al almacenar el caso:", error.message);
    res.status(500).json({ message: "Error al almacenar el caso médico" });
  }
};

exports.getCaseById = async (req, res) => {
  const { id } = req.params;

  try {
    // Llamamos al servicio para obtener el caso médico y la información relacionada
    const { caso, sesiones, examenes } = await CaseService.getCaseById(id);

    // Calculamos el porcentaje de éxito
    const sesionesExitosas = sesiones.filter((sesion) => sesion.exito).length;
    caso.porcentaje_exito =
      sesiones.length > 0
        ? ((sesionesExitosas / sesiones.length) * 100).toFixed(2)
        : 0;

    // Renderizamos la vista con los datos obtenidos
    const fromAnalyze = req.query.fromAnalyze === "true";
    const originalCase = req.query.originalCase;

    res.render("cases/show", {
      caso,
      sesiones,
      examenes,
      fromAnalyze,
      originalCase,
    });
  } catch (error) {
    console.error("Error al obtener el caso médico:", error.message);
    res.status(500).render("errors/500", {
      message: `Error al obtener la historia médica: ${error.message}`,
    });
  }
};

exports.showEditTreatmentForm = async (req, res) => {
  try {
    const { id } = req.params;
    const { tratamientoAnalizado } = req.query;

    // Buscar el caso por ID
    const { data: caso, error: caseError } = await Case.findById(id);
    if (caseError || !caso) {
      return res.status(404).render("errors/404", {
        message: "Caso no encontrado.",
      });
    }

    res.render("cases/edit-treatment", {
      caso,
      tratamientoAnalizado,
    });
  } catch (error) {
    console.error(
      "Error al cargar la vista de edición de tratamiento:",
      error.message
    );
    res.status(500).render("errors/500", {
      message: "Error al cargar la vista de edición de tratamiento.",
    });
  }
};

exports.createSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { evolucion, exito, tratamiento, notas } = req.body;

    // Crear la sesión utilizando el servicio
    await CaseService.createSession(id, evolucion, exito, tratamiento, notas);

    // Redirigir a la página del caso después de crear la sesión
    res.redirect(`/api/cases/${id}`);
  } catch (error) {
    console.error("Error al crear la sesión:", error.message);
    res.status(500).render("errors/500", {
      message: "Error al crear la sesión",
    });
  }
};

exports.showCreateCaseForm = async (req, res) => {
  if (req.session.userRole === "medico" || req.session.userRole === "admin") {
    try {
      const { data: pacientes, error } = await User.findByRole("paciente");
      if (error) throw error;

      res.render("cases/create", { pacientes });
    } catch (error) {
      console.error("Error al obtener la lista de pacientes:", error.message);
      res
        .status(500)
        .json({ message: "Error al obtener la lista de pacientes" });
    }
  } else {
    res.status(403).send("Acceso denegado");
  }
};

exports.showEditCaseForm = async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener el caso a editar
    const { data: caso, error: caseError } = await Case.findById(id);
    if (caseError || !caso)
      return res
        .status(404)
        .render("errors/404", { message: "Caso no encontrado" });

    caso.fecha_inicio = caso.fecha_inicio ? new Date(caso.fecha_inicio) : null;
    caso.fecha_final = caso.fecha_final ? new Date(caso.fecha_final) : null;

    const { data: pacientes, error: patientsError } = await User.findByRole(
      "paciente"
    );
    if (patientsError) throw patientsError;

    res.render("cases/edit", { caso, pacientes });
  } catch (error) {
    console.error("Error al cargar el formulario de edición:", error);
    res.status(500).render("errors/500", {
      message: "Error al cargar el formulario de edición",
    });
  }
};

exports.updateCase = async (req, res) => {
  const {
    user_id,
    enfermedad,
    diagnostico,
    sintomas,
    tratamiento_inicial,
    fecha_inicio,
    fecha_final,
    uso_medicamento_dias,
    completado,
  } = req.body;

  try {
    console.log("Datos recibidos para actualización:", req.body);

    // Usar el servicio para actualizar el caso
    const result = await CaseService.updateCase(req.params.id, {
      user_id,
      enfermedad,
      diagnostico,
      sintomas,
      tratamiento_inicial,
      fecha_inicio,
      fecha_final,
      uso_medicamento_dias,
      completado,
    });

    if (result.success) {
      res.redirect(`/api/cases/${req.params.id}`);
    } else {
      res.status(400).json({ message: "Error al actualizar el caso médico" });
    }
  } catch (error) {
    console.error("Error al actualizar el caso:", error.message);
    res.status(500).render("errors/500", {
      message: "Error al actualizar la historia médica",
    });
  }
};

exports.deleteCase = async (req, res) => {
  try {
    const { error } = await Case.delete(req.params.id);
    if (error) throw error;

    res.redirect("/api/cases");
  } catch (error) {
    console.error("Error al eliminar el caso:", error);
    res.status(500).render("errors/500", {
      message: "Error al eliminar la historia médica",
    });
  }
};
exports.compareCases = async (req, res) => {
  try {
    const { enfermedad } = req.body;

    // Llamar al servicio para comparar casos médicos
    const result = await CaseService.compareCases(enfermedad);

    res.status(200).json(result);
  } catch (error) {
    console.error("Error al comparar casos:", error.message);
    res.status(500).json({ message: error.message });
  }
};