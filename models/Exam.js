const supabase = require("../config/supabase");
class Exam {
  static async create(examData) {
    const { data, error } = await supabase
      .from("exams")
      .insert(examData)
      .select();

    if (error) throw new Error(`Error al crear el examen: ${error.message}`);
    return data[0];
  }

  static async findByCaseId(caseId) {
    const { data, error } = await supabase
      .from("exams")
      .select("*")
      .eq("case_id", caseId);

    if (error) throw new Error(`Error al obtener exámenes: ${error.message}`);
    return data;
  }

  static async findById(id) {
    console.log("Buscando examen con ID:", id);
    const { data, error } = await supabase
      .from("exams")
      .select("*")
      .eq("id", parseInt(id, 10))
      .single();

    console.log("Datos obtenidos:", data, "Error:", error);

    if (error) {
      throw new Error(`Error al obtener el examen: ${error.message}`);
    }
    return data;
  }

  static async update(id, updateData) {
    const { data, error } = await supabase
      .from("exams")
      .update(updateData)
      .eq("id", id)
      .select(); // Asegúrate de usar SELECT para obtener los datos actualizados

    if (error) {
      throw new Error(`Error al actualizar el examen: ${error.message}`);
    }

    if (!data || data.length === 0) {
      throw new Error(`No se encontró ningún examen con el ID: ${id}`);
    }

    return data[0];
  }

  static async delete(id) {
    const { data, error } = await supabase
      .from("exams")
      .delete()
      .eq("id", id)
      .select("*"); // Devuelve los datos eliminados

    if (error) throw new Error(`Error al eliminar el examen: ${error.message}`);
    return data && data.length > 0 ? data[0] : null;
  }
  // Método para buscar exámenes por ID de sesión
  static async findBySessionId(sessionId) {
    const { data, error } = await supabase
      .from("exams")
      .select("*")
      .eq("session_id", sessionId);
    if (error) {
      throw new Error(`Error al obtener exámenes: ${error.message}`);
    }
    return { data, error };
  }
}

module.exports = Exam;
