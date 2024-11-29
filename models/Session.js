const supabase = require("../config/supabase");
const Case = require("./Case");

class Session {
  static async create(data) {
    const { data: createdSession, error } = await supabase
      .from("sessions")
      .insert([data])
      .select();

    if (error) throw new Error(`Error al crear sesión: ${error.message}`);

    // Actualizar porcentaje de éxito del caso asociado
    await this.updateCaseSuccessRate(data.case_id);

    return createdSession;
  }

  static async findByCaseId(caseId) {
    const { data, error } = await supabase
      .from("sessions")
      .select("*")
      .eq("case_id", caseId)
      .order("fecha", { ascending: true });

    if (error) {
      console.error("Error al obtener sesiones en Supabase:", error.message);
      return { data: [], error };
    }

    console.log("Datos de sesiones obtenidos:", data);
    return { data, error: null };
  }

  static async update(id, data) {
    const { error } = await supabase.from("sessions").update(data).eq("id", id);

    if (error) throw new Error(`Error al actualizar sesión: ${error.message}`);

    // Actualizar porcentaje de éxito del caso asociado
    await this.updateCaseSuccessRate(data.case_id);
  }

  static async delete(id) {
    // Obtener la sesión antes de eliminarla
    const { data: session, error: findError } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", id)
      .single();

    if (findError)
      throw new Error(`Error al obtener sesión: ${findError.message}`);

    const { error: deleteError } = await supabase
      .from("sessions")
      .delete()
      .eq("id", id);

    if (deleteError)
      throw new Error(`Error al eliminar sesión: ${deleteError.message}`);

    // Actualizar porcentaje de éxito del caso asociado
    await this.updateCaseSuccessRate(session.case_id);
  }

  static async updateCaseSuccessRate(caseId) {
    // Obtener todas las sesiones asociadas al caso
    const { data: sessions, error: sessionError } = await supabase
      .from("sessions")
      .select("*")
      .eq("case_id", caseId);

    if (sessionError)
      throw new Error(`Error al obtener sesiones: ${sessionError.message}`);

    // Calcular el porcentaje de éxito
    const totalSessions = sessions.length;
    const successfulSessions = sessions.filter(
      (session) => session.exito
    ).length;

    const successRate =
      totalSessions > 0 ? (successfulSessions / totalSessions) * 100 : 0;

    // Actualizar el porcentaje de éxito en la tabla de casos
    const { error: updateError } = await Case.update(caseId, {
      porcentaje_exito: successRate,
    });

    if (updateError)
      throw new Error(
        `Error al actualizar porcentaje de éxito: ${updateError.message}`
      );
  }
  static async findById(id) {
    const { data, error } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw new Error(`Error al obtener sesión: ${error.message}`);
    return { data };
  }

  static async update(id, updates) {
    const { data, error } = await supabase
      .from("sessions")
      .update(updates)
      .eq("id", id)
      .select(); // Asegura devolver datos actualizados si existen

    if (error) throw new Error(`Error al actualizar sesión: ${error.message}`);

    return { data, error }; // Devuelve un objeto con data y error
  }

  static async delete(id) {
    const { data, error } = await supabase
      .from("sessions")
      .delete()
      .eq("id", id)
      .select(); // Asegura devolver información de los registros eliminados

    if (error) throw new Error(`Error al eliminar sesión: ${error.message}`);

    // Si no se elimina ningún registro, lanzar un error personalizado
    if (!data || data.length === 0) {
      throw new Error(`No se encontró ninguna sesión con ID: ${id}`);
    }

    return { data, error }; // Retorna siempre un objeto con `data` y `error`
  }
}

module.exports = Session;
