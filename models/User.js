const supabase = require("../config/supabase");
const bcrypt = require("bcryptjs");

class User {
  static async create(data) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);
    data.password = hashedPassword;
    return await supabase.from("users").insert([data]);
  }

  static async findByEmail(email) {
    return await supabase.from("users").select("*").eq("email", email).single();
  }

  static async findById(id) {
    return await supabase.from("users").select("*").eq("id", id).single();
  }
  static async findByRole(role) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("role", role);
    if (error) {
      console.error("Error al obtener usuarios por rol:", error);
      return { error };
    }
    return { data };
  }
}

module.exports = User;
