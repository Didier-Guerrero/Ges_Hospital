exports.getPatientAppointments = (req, res) => {
  if (req.session.userRole === "paciente") {
    const appointments = []; 
    res.render("appointments/index_patient", { appointments });
  } else {
    res.status(403).send("Acceso denegado");
  }
};


exports.getDoctorAdminAppointments = (req, res) => {
  if (req.session.userRole === "medico" || req.session.userRole === "admin") {
    const appointments = [];
    res.render("appointments/index_doctor_admin", { appointments });
  } else {
    res.status(403).send("Acceso denegado");
  }
};
