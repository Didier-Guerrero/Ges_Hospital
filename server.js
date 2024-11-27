const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
require("dotenv").config();
const path = require("path");

// Inicialización de la aplicación
const app = express();

// Configuración de archivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// Configuración de body-parser para manejar JSON y formularios
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuración de method-override para manejar métodos PUT y DELETE
app.use(methodOverride("_method"));

// Configuración del motor de plantillas EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Configuración de sesiones
app.use(
  session({
    secret: process.env.SESSION_SECRET || "mysecretkey",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Cambiar a true si se utiliza HTTPS
  })
);

// Middleware para compartir la sesión en todas las vistas
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// Ruta raíz
app.get("/", (req, res) => {
  res.redirect("/api/cases");
});

// Importación de rutas
app.use("/api/cases", require("./routes/cases"));
app.use("/api/users", require("./routes/users"));
app.use("/api/sessions", require("./routes/sessions"));

// Manejo de errores para rutas no encontradas
app.use((req, res) => {
  res.status(404).render("errors/404", { message: "Página no encontrada" });
});

// Inicio del servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
