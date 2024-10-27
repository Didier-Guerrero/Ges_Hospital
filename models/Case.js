const supabase = require("../config/supabase");

class Case {
  // Método para crear un nuevo caso
  static async create(data) {
    return await supabase.from("cases").insert([data]);
  }

  // Método para obtener todos los casos
  static async findAll() {
    return await supabase.from("cases").select("*");
  }

  // Método para obtener un caso por su ID
  static async findById(id) {
    return await supabase.from("cases").select("*").eq("id", id).single();
  }

  // Método para actualizar un caso por su ID
  static async update(id, data) {
    return await supabase.from("cases").update(data).eq("id", id);
  }

  // Método para eliminar un caso por su ID
  static async delete(id) {
    return await supabase.from("cases").delete().eq("id", id);
  }

  // Método para buscar casos similares en base a una condición (por ejemplo, misma enfermedad)
  static async findByCondition(condition) {
    return await supabase.from("cases").select("*").match(condition);
  }
  static async findByEnfermedad(enfermedad) {
    return await supabase
      .from("cases")
      .select("*")
      .ilike("enfermedad", `%${enfermedad}%`);
  }
}

module.exports = Case;
