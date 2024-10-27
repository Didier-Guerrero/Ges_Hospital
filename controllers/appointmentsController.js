exports.getPatientAppointments = (req, res) => {
  if (req.session.userRole === "paciente") {
    const appointments = []; // Aquí obtendrías las citas específicas del paciente
    res.render("appointments/index_patient", { appointments });
  } else {
    res.status(403).send("Acceso denegado");
  }
};

// Muestra la agenda y permite la creación de citas para médicos y administradores
exports.getDoctorAdminAppointments = (req, res) => {
  if (req.session.userRole === "medico" || req.session.userRole === "admin") {
    const appointments = []; // Aquí se obtendrían todas las citas de la base de datos
    res.render("appointments/index_doctor_admin", { appointments });
  } else {
    res.status(403).send("Acceso denegado");
  }
};
