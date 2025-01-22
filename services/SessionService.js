const Session = require('../models/Session');
const Case = require('../models/Case');
const ExamModel = require('../models/Exam');

class SessionService {

  async createSession(caseId, { evolucion, tratamiento, observaciones, exito }) {
    try {
      // Crear la sesión asociada al caso médico
      await Session.create({
        case_id: caseId,
        evolucion,
        tratamiento,
        observaciones,
        exito: exito === "true", // Convertir a booleano
        fecha: new Date(), // Fecha actual
      });
    } catch (error) {
      throw new Error("Error al crear la sesión: " + error.message);
    }
  }

  async getSessionDetails(sessionId) {
    try {
      const { data: sesion, error } = await Session.findById(sessionId);
      if (error || !sesion) {
        throw new Error("Sesión no encontrada.");
      }

      const { data: caso, error: caseError } = await Case.findById(sesion.case_id);
      if (caseError || !caso) {
        throw new Error("Caso asociado no encontrado.");
      }

      const { data: examenes, error: examenesError } = await ExamModel.findBySessionId(sessionId);
      if (examenesError) {
        throw new Error("Error al obtener los exámenes asociados a la sesión.");
      }

      return { sesion, caso, examenes };
    } catch (error) {
      throw new Error("Error al obtener detalles de la sesión: " + error.message);
    }
  }

  async updateSession(sessionId, { evolucion, tratamiento, observaciones, exito }) {
    try {
      const { data: updatedSession, error } = await Session.update(sessionId, {
        evolucion,
        tratamiento,
        observaciones,
        exito: exito === "true",
      });

      if (error) {
        throw new Error("Error al actualizar la sesión.");
      }

      return updatedSession;
    } catch (error) {
      throw new Error("Error al actualizar la sesión: " + error.message);
    }
  }

  async deleteSession(sessionId) {
    try {
      const { data: deletedSession, error } = await Session.delete(sessionId);
      if (error) {
        throw new Error("Error al eliminar la sesión.");
      }
      return deletedSession;
    } catch (error) {
      throw new Error("Error al eliminar la sesión: " + error.message);
    }
  }
}

module.exports = new SessionService();
