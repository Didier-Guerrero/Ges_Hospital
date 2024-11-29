const Case = require("../models/Case");
const User = require("../models/User");
const SessionModel = require("../models/Session");
const ExamModel = require("../models/Exam");

exports.getCases = async (req, res) => {
  try {
    const { enfermedad } = req.query;
    let cases = [];
    let searchResults = [];
    let searchQuery = enfermedad || "";

    if (req.session.userRole === "paciente") {
      const { data, error } = await Case.findAllByUserId(req.session.userId);
      if (error) throw error;
      cases = data || [];
      res.render("cases/index_patient", { cases });
    } else if (["medico", "admin"].includes(req.session.userRole)) {
      let data, error;

      if (enfermedad) {
        ({ data, error } = await Case.findByEnfermedad(enfermedad));
        searchResults = data || [];
      } else {
        ({ data, error } = await Case.findAll());
        cases = data || [];
      }

      const { data: pacientes, error: patientsError } = await User.findByRole(
        "paciente"
      );
      if (patientsError) throw patientsError;

      const pacientesDict = {};
      pacientes.forEach((paciente) => {
        pacientesDict[paciente.id] = paciente.nombre;
      });

      cases = cases.map((caso) => ({
        ...caso,
        patientName: pacientesDict[caso.user_id] || "Paciente no encontrado",
      }));

      searchResults = searchResults.map((result) => ({
        ...result,
        patientName: pacientesDict[result.user_id] || "Paciente no encontrado",
      }));

      console.log("Casos con nombres asignados:", cases);

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
    const fechaInicio = new Date(fecha_inicio);
    const fechaFinal = new Date(fecha_final);
    const duracionRealTratamiento = Math.ceil(
      (fechaFinal - fechaInicio) / (1000 * 60 * 60 * 24)
    );

    let porcentajeExito = 0;
    if (uso_medicamento_dias >= duracionRealTratamiento * 0.8) {
      porcentajeExito = 100;
    } else if (uso_medicamento_dias >= duracionRealTratamiento * 0.5) {
      porcentajeExito = 75;
    } else {
      porcentajeExito = 50;
    }

    const { data, error } = await Case.create({
      user_id,
      doctor_id: doctorId,
      enfermedad,
      diagnostico,
      sintomas,
      tratamiento_inicial,
      duracion_tratamiento: duracionRealTratamiento,
      porcentaje_exito: porcentajeExito,
      fecha_inicio: fechaInicio.toISOString(),
      fecha_final: fechaFinal.toISOString(),
      uso_medicamento_dias: parseInt(uso_medicamento_dias, 10),
      completado: false, // Añadido según la nueva lógica
    });

    if (error) throw error;

    // Redirigir al flujo correcto con el ID devuelto
    res.redirect(`/api/cases/${data[0].id}/options`);
  } catch (error) {
    console.error("Error al crear el caso médico:", error.message);
    res
      .status(500)
      .json({ message: `Error al crear el caso médico: ${error.message}` });
  }
};

exports.showOptions = async (req, res) => {
  try {
    const { id } = req.params;

    // Asegúrate de que el ID es un número válido
    if (!id || isNaN(Number(id))) {
      console.error("El ID proporcionado no es válido:", id);
      return res
        .status(400)
        .json({ message: "El ID proporcionado no es válido." });
    }

    console.log("ID recibido en showOptions:", id); // Depuración: verifica el ID recibido

    // Realiza la consulta a Supabase
    const { data: caso, error } = await Case.findById(id);

    // Depuración: verifica si hubo error en la consulta
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

    console.log(`Caso encontrado con ID ${id}:`, caso); // Depuración: muestra los datos encontrados

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

    // Buscar el caso principal
    const { data: caso, error: caseError } = await Case.findById(id);
    if (caseError || !caso) throw new Error("Caso no encontrado");

    if (!caso.enfermedad || caso.enfermedad.trim() === "") {
      throw new Error("La enfermedad no está definida para este caso");
    }

    // Obtener el nombre del paciente asociado al caso principal
    const { data: paciente, error: pacienteError } = await User.findById(
      caso.user_id
    );
    if (pacienteError) {
      console.error(
        "Error al obtener paciente del caso principal:",
        pacienteError.message
      );
      throw new Error(
        "Error al obtener el paciente asociado al caso principal."
      );
    }
    caso.patientName = paciente ? paciente.nombre : "Paciente no encontrado";

    // Buscar casos similares
    const { data: casosSimilares, error: similarError } =
      await Case.findSimilarEnfermedad(caso.enfermedad);
    if (similarError) throw new Error("Error al buscar casos similares.");

    // Obtener los nombres de los pacientes para los casos similares
    for (const similar of casosSimilares) {
      const { data: pacienteSimilar, error: pacienteSimilarError } =
        await User.findById(similar.user_id);
      if (pacienteSimilarError) {
        console.error(
          `Error al obtener paciente del caso similar ${similar.id}:`,
          pacienteSimilarError.message
        );
        similar.patientName = "Paciente no encontrado";
      } else {
        similar.patientName = pacienteSimilar
          ? pacienteSimilar.nombre
          : "Paciente no encontrado";
      }
    }

    res.render("cases/analyze", {
      caso,
      casosSimilares,
    });
  } catch (error) {
    console.error("Error al analizar el caso:", error.message);
    res.status(500).json({
      message: `Error al analizar el caso médico: ${error.message}`,
    });
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
  try {
    const caseId = parseInt(req.params.id, 10);

    if (isNaN(caseId)) {
      return res.status(400).render("errors/400", {
        message: "ID del caso inválido. Debe ser un número.",
      });
    }

    const { data: caso, error: caseError } = await Case.findById(caseId);
    if (caseError || !caso) {
      return res.status(404).render("errors/404", {
        message: "Caso no encontrado.",
      });
    }

    const { data: sesiones = [], error: sessionError } =
      await SessionModel.findByCaseId(caseId);
    if (sessionError) {
      console.error("Error al obtener sesiones:", sessionError.message);
      return res.status(500).render("errors/500", {
        message: "Error al obtener las sesiones asociadas.",
      });
    }

    const examenes = [];
    for (const sesion of sesiones) {
      const { data: examenesSesion, error: examenesError } =
        await ExamModel.findBySessionId(sesion.id);
      if (examenesError) {
        console.error(
          `Error al obtener exámenes para la sesión ${sesion.id}:`,
          examenesError.message
        );
        continue;
      }
      examenes.push(...(examenesSesion || []));
    }

    const sesionesExitosas = sesiones.filter((sesion) => sesion.exito).length;
    caso.porcentaje_exito =
      sesiones.length > 0
        ? ((sesionesExitosas / sesiones.length) * 100).toFixed(2)
        : 0;

    const { data: paciente, error: pacienteError } = await User.findById(
      caso.user_id
    );
    if (pacienteError) {
      console.error("Error al obtener paciente:", pacienteError.message);
      throw new Error("Error al obtener el paciente asociado al caso.");
    }

    caso.patientName = paciente ? paciente.nombre : "Paciente no encontrado";

    const fromAnalyze = req.query.fromAnalyze === "true";
    const originalCase = req.query.originalCase;

    res.render("cases/show", {
      caso,
      sesiones: sesiones || [],
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
    const { id } = req.params; // ID del caso que se va a editar (originalCase)
    const { tratamientoAnalizado } = req.query; // Tratamiento del caso analizado

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
    const { id } = req.params; // ID del caso médico
    const { evolucion, exito, tratamiento, notas } = req.body;

    const nuevaSesion = {
      case_id: id,
      fecha: new Date(),
      evolucion,
      exito: exito === "true",
      tratamiento,
      notas,
    };

    const { error } = await SessionModel.create(nuevaSesion);
    if (error) throw error;

    // Recalcular el porcentaje de éxito después de crear la sesión
    const { data: sesiones, error: sessionError } =
      await SessionModel.findByCaseId(id);
    if (sessionError) throw sessionError;

    const totalSesiones = sesiones.length;
    const sesionesExitosas = sesiones.filter((sesion) => sesion.exito).length;

    const porcentajeExito =
      totalSesiones > 0
        ? ((sesionesExitosas / totalSesiones) * 100).toFixed(2)
        : 0;

    const { error: updateError } = await Case.update(id, {
      porcentaje_exito: parseFloat(porcentajeExito),
    });
    if (updateError) throw updateError;

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

    const fechaInicio = new Date(fecha_inicio);
    const fechaFinal = new Date(fecha_final);

    const duracionRealTratamiento = Math.ceil(
      (fechaFinal - fechaInicio) / (1000 * 60 * 60 * 24)
    );

    let porcentajeExito = 0;

    if (uso_medicamento_dias >= duracionRealTratamiento * 0.8) {
      porcentajeExito = 100;
    } else if (uso_medicamento_dias >= duracionRealTratamiento * 0.5) {
      porcentajeExito = 75;
    } else {
      porcentajeExito = 50;
    }

    const { error } = await Case.update(req.params.id, {
      user_id,
      enfermedad,
      diagnostico,
      sintomas,
      tratamiento_inicial,
      duracion_tratamiento: duracionRealTratamiento,
      porcentaje_exito: porcentajeExito,
      fecha_inicio,
      fecha_final,
      uso_medicamento_dias,
      completado: completado === "true",
    });

    if (error) throw error;

    res.redirect(`/api/cases/${req.params.id}`);
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
    const { data: casosSimilares, error } = await Case.findByCondition({
      enfermedad,
    });

    if (error || !casosSimilares.length) {
      return res
        .status(200)
        .json({ message: "No hay casos similares registrados para comparar" });
    }

    const casosExitosos = casosSimilares.filter(
      (caso) => caso.exito === true
    ).length;
    const totalCasos = casosSimilares.length;
    const porcentajeExito = ((casosExitosos / totalCasos) * 100).toFixed(2);

    res.status(200).json({
      totalCasos,
      casosExitosos,
      porcentajeExito,
      tratamientos: casosSimilares.map((caso) => ({
        tratamiento: caso.tratamiento_inicial,
        exito: caso.exito,
        duracion: caso.duracion_tratamiento,
      })),
    });
  } catch (error) {
    console.error("Error al comparar casos:", error);
    res.status(500).json({ message: "Error al comparar casos médicos" });
  }
};
