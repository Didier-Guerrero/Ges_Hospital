const Case = require("../models/Case");
const User = require("../models/User");

// Lista de todas las historias médicas según el rol del usuario
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
    } else if (
      req.session.userRole === "medico" ||
      req.session.userRole === "admin"
    ) {
      let data, error;

      // Obtener los casos y todos los usuarios con rol de paciente
      if (enfermedad) {
        ({ data, error } = await Case.findByEnfermedad(enfermedad));
        searchResults = data || [];
      } else {
        ({ data, error } = await Case.findAll());
        cases = data || [];
      }

      // Depuración: Verificar los casos obtenidos
      console.log("Casos obtenidos:", cases);

      const { data: pacientes, error: patientsError } = await User.findByRole(
        "paciente"
      );
      if (patientsError) throw patientsError;

      // Depuración: Verificar los pacientes obtenidos
      console.log("Pacientes obtenidos:", pacientes);

      // Crear un diccionario de pacientes con el user_id como clave y el nombre como valor
      const pacientesDict = {};
      pacientes.forEach((paciente) => {
        pacientesDict[paciente.id] = paciente.nombre;
      });

      // Depuración: Verificar el diccionario de pacientes
      console.log("Diccionario de pacientes:", pacientesDict);

      // Asignar el nombre de cada paciente a su respectivo caso
      cases = cases.map((caso) => ({
        ...caso,
        patientName: pacientesDict[caso.user_id] || "Paciente no encontrado",
      }));

      searchResults = searchResults.map((result) => ({
        ...result,
        patientName: pacientesDict[result.user_id] || "Paciente no encontrado",
      }));

      // Depuración: Verificar los casos con nombres de pacientes asignados
      console.log("Casos con nombres asignados:", cases);

      res.render("cases/index_doctor_admin", {
        cases,
        searchResults,
        searchQuery,
      });
    } else {
      res.status(403).send("Acceso denegado");
    }
  } catch (error) {
    console.error("Error al obtener los casos:", error);
    res.status(500).json({ message: "Error al obtener las historias médicas" });
  }
};

// Crear una nueva historia médica con cálculo de porcentaje de éxito
exports.createCase = async (req, res) => {
  const {
    user_id,
    enfermedad,
    diagnostico,
    sintomas,
    tratamiento_inicial,
    duracion_tratamiento,
    exito,
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
      exito: exito === "true",
      porcentaje_exito: porcentajeExito,
      fecha_inicio,
      fecha_final,
      uso_medicamento_dias,
    });

    if (error) throw error;

    res.redirect("/api/cases");
  } catch (error) {
    console.error("Error al crear el caso médico:", error.message);
    res.status(500).json({ message: "Error al crear el caso médico" });
  }
};

// Obtener los detalles de una historia médica por ID
exports.getCaseById = async (req, res) => {
  try {
    const { data: caso, error } = await Case.findById(req.params.id);
    if (error || !caso)
      return res
        .status(404)
        .render("errors/404", { message: "Caso no encontrado" });

    // Obtener el nombre del paciente asociado al caso
    const { data: paciente, error: pacienteError } = await User.findById(
      caso.user_id
    );
    if (pacienteError) throw pacienteError;

    // Asignar el nombre del paciente al caso para la vista
    caso.patientName = paciente ? paciente.nombre : "Paciente no encontrado";

    res.render("cases/show", { caso });
  } catch (error) {
    console.error("Error al obtener el caso:", error);
    res
      .status(500)
      .render("errors/500", { message: "Error al obtener la historia médica" });
  }
};

// Renderizar el formulario de creación de casos médicos
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

// Renderizar el formulario de edición de casos médicos
exports.showEditCaseForm = async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener el caso a editar
    const { data: caso, error: caseError } = await Case.findById(id);
    if (caseError || !caso)
      return res
        .status(404)
        .render("errors/404", { message: "Caso no encontrado" });

    // Convertir fecha_inicio y fecha_final a objetos Date si existen
    caso.fecha_inicio = caso.fecha_inicio ? new Date(caso.fecha_inicio) : null;
    caso.fecha_final = caso.fecha_final ? new Date(caso.fecha_final) : null;

    // Obtener la lista de pacientes para el dropdown
    const { data: pacientes, error: patientsError } = await User.findByRole(
      "paciente"
    );
    if (patientsError) throw patientsError;

    // Renderizar la vista de edición con el caso y los pacientes
    res.render("cases/edit", { caso, pacientes });
  } catch (error) {
    console.error("Error al cargar el formulario de edición:", error);
    res.status(500).render("errors/500", {
      message: "Error al cargar el formulario de edición",
    });
  }
};

// Actualizar una historia médica
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
  } = req.body;

  try {
    const fechaInicio = new Date(fecha_inicio);
    const fechaFinal = new Date(fecha_final);

    // Calcular duración real del tratamiento en días
    const duracionRealTratamiento = Math.ceil(
      (fechaFinal - fechaInicio) / (1000 * 60 * 60 * 24)
    );

    // Calcular el porcentaje de éxito basado en la duración y el uso del medicamento
    let porcentajeExito = 0;

    if (uso_medicamento_dias >= duracionRealTratamiento * 0.8) {
      porcentajeExito = 100;
    } else if (uso_medicamento_dias >= duracionRealTratamiento * 0.5) {
      porcentajeExito = 75;
    } else {
      porcentajeExito = 50;
    }

    // Actualizar el caso con los datos y el nuevo porcentaje de éxito
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
    });

    if (error) throw error;

    res.redirect(`/api/cases/${req.params.id}`);
  } catch (error) {
    console.error("Error al actualizar el caso:", error);
    res.status(500).render("errors/500", {
      message: "Error al actualizar la historia médica",
    });
  }
};

// Eliminar una historia médica
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

// Comparación de casos médicos
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
