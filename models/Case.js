const supabase = require("../config/supabase");

class Case {
  static async create(data) {
    return await supabase.from("cases").insert([data]);
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
