const express = require("express");
const router = express.Router();
const appointmentsController = require("../controllers/appointmentsController");
const auth = require("../middleware/auth");

// Ruta para ver citas del paciente
router.get("/patient", auth, appointmentsController.getPatientAppointments);

// Ruta para que médicos/administradores vean y agenden citas
router.get(
  "/doctor_admin",
  auth,
  appointmentsController.getDoctorAdminAppointments
);

module.exports = router;
