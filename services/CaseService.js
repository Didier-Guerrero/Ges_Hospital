const Case = require("../models/Case");
const User = require("../models/User");
const SessionModel = require("../models/Session");
const ExamModel = require("../models/Exam");

class CaseService {

  // Obtener todos los casos de un paciente
  static async getCasesForPatient(userId) {
    try {
      const { data, error } = await Case.findAllByUserId(userId);
      if (error) throw new Error("Error al obtener los casos del paciente");
      return data || [];
    } catch (error) {
      throw new Error(`Error al obtener los casos del paciente: ${error.message}`);
    }
  }

  // Obtener todos los casos para un médico o administrador
  static async getCasesForDoctorAdmin(enfermedad) {
    try {
      let cases = [];
      let searchResults = [];

      if (enfermedad) {
        // Buscar casos por enfermedad
        const { data, error } = await Case.findByEnfermedad(enfermedad);
        if (error) throw new Error("Error al buscar casos por enfermedad");
        searchResults = data || [];
      } else {
        // Obtener todos los casos
        const { data, error } = await Case.findAll();
        if (error) throw new Error("Error al obtener todos los casos");
        cases = data || [];
      }

      // Obtener todos los pacientes
      const { data: pacientes, error: patientsError } = await User.findByRole("paciente");
      if (patientsError) throw patientsError;

      const pacientesDict = {};
      pacientes.forEach((paciente) => {
        pacientesDict[paciente.id] = paciente.nombre;
      });

      // Asignar el nombre del paciente a cada caso
      cases = cases.map((caso) => ({
        ...caso,
        patientName: pacientesDict[caso.user_id] || "Paciente no encontrado",
      }));

      searchResults = searchResults.map((result) => ({
        ...result,
        patientName: pacientesDict[result.user_id] || "Paciente no encontrado",
      }));

      return { cases, searchResults };
    } catch (error) {
      throw new Error(`Error al obtener los casos para el doctor/admin: ${error.message}`);
    }
  }
  static async createCase(
    user_id,
    doctor_id,
    enfermedad,
    diagnostico,
    sintomas,
    tratamiento_inicial,
    duracion_tratamiento,
    fecha_inicio,
    fecha_final,
    uso_medicamento_dias
  ) {
    try {
      if (!fecha_inicio || !fecha_final) {
        throw new Error("Las fechas de inicio y final son obligatorias.");
      }

      const fechaInicio = new Date(fecha_inicio);
      const fechaFinal = new Date(fecha_final);

      if (isNaN(fechaInicio.getTime()) || isNaN(fechaFinal.getTime())) {
        throw new Error("Las fechas proporcionadas son inválidas.");
      }

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

      // Crea el caso médico
      const { data, error } = await Case.create({
        user_id,
        doctor_id,
        enfermedad,
        diagnostico,
        sintomas,
        tratamiento_inicial,
        duracion_tratamiento: duracionRealTratamiento,
        porcentaje_exito: porcentajeExito,
        fecha_inicio: fechaInicio.toISOString(),
        fecha_final: fechaFinal.toISOString(),
        uso_medicamento_dias: parseInt(uso_medicamento_dias, 10),
        completado: false,
      });

      if (error) throw error;

      return data;  // Devuelve el caso creado

    } catch (error) {
      throw new Error(`Error al crear el caso médico: ${error.message}`);
    }
  }
  static async getCaseById(id) {
    try {
      if (!id || isNaN(Number(id))) {
        throw new Error("El ID proporcionado no es válido.");
      }

      const { data: caso, error } = await Case.findById(id);

      if (error) {
        console.error(`Error al buscar el caso con ID ${id}:`, error.message);
        throw new Error("Error al consultar el caso en la base de datos");
      }

      if (!caso) {
        console.error(`Caso con ID ${id} no encontrado`);
        throw new Error("Caso no encontrado");
      }

      return caso; // Devuelve el caso encontrado
    } catch (error) {
      throw new Error(`Error al obtener el caso: ${error.message}`);
    }
  }
  static async analyzeCaseById(id) {
    try {
      // Verificar que el ID sea válido
      if (!id || isNaN(Number(id))) {
        throw new Error("El ID proporcionado no es válido.");
      }

      // Obtener el caso por ID
      const { data: caso, error: caseError } = await Case.findById(id);
      if (caseError || !caso) {
        throw new Error("Caso no encontrado");
      }

      // Verificar que la enfermedad esté definida
      if (!caso.enfermedad || caso.enfermedad.trim() === "") {
        throw new Error("La enfermedad no está definida para este caso");
      }

      // Obtener el paciente asociado al caso
      const { data: paciente, error: pacienteError } = await User.findById(caso.user_id);
      if (pacienteError) {
        console.error("Error al obtener paciente del caso principal:", pacienteError.message);
        throw new Error("Error al obtener el paciente asociado al caso.");
      }

      // Asignar el nombre del paciente al caso
      caso.patientName = paciente ? paciente.nombre : "Paciente no encontrado";

      // Buscar casos similares
      const { data: casosSimilares, error: similarError } = await Case.findSimilarEnfermedad(caso.enfermedad);
      if (similarError) {
        throw new Error("Error al buscar casos similares.");
      }

      // Asignar los nombres de los pacientes a los casos similares
      for (const similar of casosSimilares) {
        const { data: pacienteSimilar, error: pacienteSimilarError } = await User.findById(similar.user_id);
        if (pacienteSimilarError) {
          console.error(`Error al obtener paciente del caso similar ${similar.id}:`, pacienteSimilarError.message);
          similar.patientName = "Paciente no encontrado";
        } else {
          similar.patientName = pacienteSimilar ? pacienteSimilar.nombre : "Paciente no encontrado";
        }
      }

      return { caso, casosSimilares }; // Devolvemos los datos del caso y los casos similares
    } catch (error) {
      throw new Error(`Error al analizar el caso: ${error.message}`);
    }
  }
  static async getCaseById(id) {
    try {
      // Verificar que el ID sea válido
      if (!id || isNaN(Number(id))) {
        throw new Error("El ID proporcionado no es válido.");
      }

      // Obtener el caso por ID
      const { data: caso, error: caseError } = await Case.findById(id);
      if (caseError || !caso) {
        throw new Error("Caso no encontrado");
      }

      // Obtener las sesiones asociadas al caso
      const { data: sesiones = [], error: sessionError } =
        await SessionModel.findByCaseId(id);
      if (sessionError) {
        throw new Error("Error al obtener las sesiones asociadas.");
      }

      // Obtener los exámenes asociados a las sesiones
      const examenes = [];
      for (const sesion of sesiones) {
        const { data: examenesSesion, error: examenesError } =
          await ExamModel.findBySessionId(sesion.id);
        if (examenesError) {
          console.error(`Error al obtener exámenes para la sesión ${sesion.id}:`, examenesError.message);
          continue;
        }
        examenes.push(...(examenesSesion || []));
      }

      // Obtener el paciente asociado al caso
      const { data: paciente, error: pacienteError } = await User.findById(caso.user_id);
      if (pacienteError) {
        console.error("Error al obtener paciente:", pacienteError.message);
        throw new Error("Error al obtener el paciente asociado al caso.");
      }

      caso.patientName = paciente ? paciente.nombre : "Paciente no encontrado";

      // Devolvemos el caso, las sesiones y los exámenes
      return { caso, sesiones, examenes };
    } catch (error) {
      throw new Error(`Error al obtener el caso: ${error.message}`);
    }
  }
  static async createSession(caseId, evolucion, exito, tratamiento, notas) {
    try {
      // Crear una nueva sesión
      const nuevaSesion = {
        case_id: caseId,
        fecha: new Date(),
        evolucion,
        exito: exito === "true", // Convertir a booleano
        tratamiento,
        notas,
      };

      const { error } = await SessionModel.create(nuevaSesion);
      if (error) throw error;

      // Recalcular el porcentaje de éxito después de crear la sesión
      const { data: sesiones, error: sessionError } =
        await SessionModel.findByCaseId(caseId);
      if (sessionError) throw sessionError;

      const totalSesiones = sesiones.length;
      const sesionesExitosas = sesiones.filter((sesion) => sesion.exito).length;

      const porcentajeExito =
        totalSesiones > 0
          ? ((sesionesExitosas / totalSesiones) * 100).toFixed(2)
          : 0;

      // Actualizar el caso con el nuevo porcentaje de éxito
      const { error: updateError } = await Case.update(caseId, {
        porcentaje_exito: parseFloat(porcentajeExito),
      });
      if (updateError) throw updateError;
    } catch (error) {
      console.error("Error en la creación de la sesión:", error.message);
      throw new Error(`Error al crear la sesión: ${error.message}`);
    }
  }
  static async updateCase(id, { user_id, enfermedad, diagnostico, sintomas, tratamiento_inicial, fecha_inicio, fecha_final, uso_medicamento_dias, completado }) {
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

      // Llamar al modelo de Case para actualizar el caso
      const { error } = await Case.update(id, {
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

      if (error) throw new Error('Error al actualizar el caso médico: ' + error.message);

      return { success: true };
    } catch (error) {
      throw new Error('Error al actualizar el caso médico: ' + error.message);
    }
  }
  static async compareCases(enfermedad) {
    try {
      // Buscar casos similares a la enfermedad proporcionada
      const { data: casosSimilares, error } = await Case.findByCondition({ enfermedad });

      if (error || !casosSimilares.length) {
        throw new Error("No hay casos similares registrados para comparar");
      }

      // Calcular el porcentaje de éxito de los casos similares
      const casosExitosos = casosSimilares.filter(caso => caso.exito === true).length;
      const totalCasos = casosSimilares.length;
      const porcentajeExito = ((casosExitosos / totalCasos) * 100).toFixed(2);

      // Devolver la información de los casos comparados
      return {
        totalCasos,
        casosExitosos,
        porcentajeExito,
        tratamientos: casosSimilares.map(caso => ({
          tratamiento: caso.tratamiento_inicial,
          exito: caso.exito,
          duracion: caso.duracion_tratamiento,
        })),
      };
    } catch (error) {
      throw new Error("Error al comparar casos médicos: " + error.message);
    }
  }
}

module.exports = CaseService;