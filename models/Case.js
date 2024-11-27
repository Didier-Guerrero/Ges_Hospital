const supabase = require("../config/supabase");

class Case {
  static async create(data) {
    return await supabase.from("cases").insert([data]).select();
    if (error) throw new Error(`Error al crear caso: ${error.message}`);
    return createdCase;
  }

  static async findAll() {
    return await supabase.from("cases").select("*");
  }

  static async findById(id) {
    return await supabase.from("cases").select("*").eq("id", id).single();
  }

  static async update(id, data) {
    return await supabase.from("cases").update(data).eq("id", id);
  }

  static async delete(id) {
    return await supabase.from("cases").delete().eq("id", id);
  }

  static async findByCondition(condition) {
    return await supabase.from("cases").select("*").match(condition);
  }
  static async findByEnfermedad(enfermedad) {
    return await supabase
      .from("cases")
      .select("*")
      .ilike("enfermedad", `%${enfermedad}%`);
  }
  static async findSimilarEnfermedad(enfermedad) {
    if (!enfermedad) throw new Error("El campo enfermedad es requerido");

    const firstWord = enfermedad.split(" ")[0];

    return await supabase
      .from("cases")
      .select("*")
      .ilike("enfermedad", `%${firstWord}%`);
  }

  static async markAsCompleted(id) {
    const { data, error } = await supabase
      .from("cases")
      .update({ completado: true })
      .eq("id", id)
      .select();

    if (error)
      throw new Error(`Error al marcar como completado: ${error.message}`);
    return data;
  }

  static async findSessionsByCaseId(caseId) {
    const { data, error } = await supabase
      .from("sessions")
      .select("*")
      .eq("case_id", caseId)
      .order("fecha", { ascending: true });

    if (error) throw new Error(`Error al obtener sesiones: ${error.message}`);
    return data;
  }

  static async findAllByUserId(userId) {
    const { data, error } = await supabase
      .from("cases")
      .select("*")
      .eq("user_id", userId);

    if (error) throw error;
    return data;
  }
}

module.exports = Case;
