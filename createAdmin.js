const bcrypt = require("bcryptjs");
const supabase = require("./config/supabase");

async function createAdminUser() {
  try {
    const nombre = "Admin";
    const email = "admin@example.com";
    const password = "Admin123";
    const role = "admin";

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const { data, error } = await supabase.from("users").insert([
      {
        nombre: nombre,
        email: email,
        password: hashedPassword,
        role: role,
      },
    ]);

    if (error) {
      console.error("Error al crear el usuario administrador:", error.message);
    } else {
      console.log("Usuario administrador creado exitosamente:", data);
    }
  } catch (error) {
    console.error("Error al crear el usuario administrador:", error.message);
  }
}

createAdminUser();
