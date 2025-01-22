const Exam = require("../models/Exam");
const Session = require("../models/Session");

class ExamService {

  async createExam({ sessionId, caseId, type, requested_date, completion_date, result, status, observations }) {
    try {
      const examData = {
        session_id: sessionId,
        case_id: caseId,
        type,
        requested_date: new Date(requested_date),
        completion_date: completion_date ? new Date(completion_date) : null,
        result: result || null,
        status,
        observations: observations || null
      };
      
      const { error } = await Exam.create(examData);
      if (error) {
        throw new Error("Error al crear el examen.");
      }

      return examData;
    } catch (error) {
      throw new Error("Error al crear el examen: " + error.message);
    }
  }

  async getExamById(examId) {
    try {
      const examen = await Exam.findById(examId);
      if (!examen) {
        throw new Error("Examen no encontrado.");
      }
      return examen;
    } catch (error) {
      throw new Error("Error al obtener el examen: " + error.message);
    }
  }

  async updateExam(examId, { type, requested_date, completion_date, status, result, observations }) {
    try {
      const updatedExam = await Exam.update(examId, {
        type,
        requested_date: new Date(requested_date),
        completion_date: completion_date ? new Date(completion_date) : null,
        status,
        result,
        observations
      });
      if (!updatedExam) {
        throw new Error("Error al actualizar el examen.");
      }
      return updatedExam;
    } catch (error) {
      throw new Error("Error al actualizar el examen: " + error.message);
    }
  }

  async deleteExam(examId) {
    try {
      const examenEliminado = await Exam.delete(examId);
      if (!examenEliminado) {
        throw new Error("Examen no encontrado para eliminar.");
      }
      return examenEliminado;
    } catch (error) {
      throw new Error("Error al eliminar el examen: " + error.message);
    }
  }

  async getSessionDetails(sessionId) {
    try {
      const { data: sesion, error } = await Session.findById(sessionId);
      if (error || !sesion) {
        throw new Error("Sesión no encontrada.");
      }
      return sesion;
    } catch (error) {
      throw new Error("Error al obtener los detalles de la sesión: " + error.message);
    }
  }
}

module.exports = new ExamService();
