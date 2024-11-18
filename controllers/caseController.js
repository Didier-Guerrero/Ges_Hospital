const Case = require("../models/Case");
const User = require("../models/User");

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

    res.redirect(`/api/cases/${data[0].id}/options`);
  } catch (error) {
    console.error("Error al crear el caso médico:", error.message);
    res.status(500).json({ message: "Error al crear el caso médico" });
  }
};

exports.showOptions = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: caso, error } = await Case.findById(id);
    if (error || !caso) throw new Error("Caso no encontrado");

    res.render("cases/options", { caso });
  } catch (error) {
    console.error("Error al cargar las opciones del caso:", error.message);
    res.status(500).json({ message: "Error al cargar las opciones del caso" });
  }
};

exports.analyzeCase = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: caso, error: caseError } = await Case.findById(id);
    if (caseError || !caso) throw new Error("Caso no encontrado");

    if (!caso.enfermedad || caso.enfermedad.trim() === "") {
      throw new Error("La enfermedad no está definida para este caso");
    }

    const { data: casosSimilares, error } = await Case.findSimilarEnfermedad(
      caso.enfermedad
    );
    if (error) throw error;

    const casosExitosos = casosSimilares.filter((c) => c.exito).length;
    const porcentajeExito = (
      (casosExitosos / casosSimilares.length) *
      100
    ).toFixed(2);

    res.render("cases/analyze", {
      caso,
      casosSimilares,
      porcentajeExito,
    });
  } catch (error) {
    console.error("Error al analizar el caso:", error.message);
    res
      .status(500)
      .json({ message: `Error al analizar el caso médico: ${error.message}` });
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
    const { data: caso, error } = await Case.findById(req.params.id);
    if (error || !caso)
      return res
        .status(404)
        .render("errors/404", { message: "Caso no encontrado" });

    const { data: paciente, error: pacienteError } = await User.findById(
      caso.user_id
    );
    if (pacienteError) throw pacienteError;

    caso.patientName = paciente ? paciente.nombre : "Paciente no encontrado";

    res.render("cases/show", { caso });
  } catch (error) {
    console.error("Error al obtener el caso:", error);
    res
      .status(500)
      .render("errors/500", { message: "Error al obtener la historia médica" });
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
  } = req.body;

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
