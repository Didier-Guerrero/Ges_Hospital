const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
require("dotenv").config();
const path = require("path");

const app = express();
app.use(express.static(path.join(__dirname, "public")));
// Configuración de middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.set("view engine", "ejs");

// Configuración de la sesión
app.use(
  session({
    secret: "mysecretkey",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

// Middleware para hacer que la sesión esté disponible en todas las vistas
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// Ruta raíz para redirigir a las historias médicas o página principal
app.get("/", (req, res) => {
  res.redirect("/api/cases");
});

// Registro de rutas
app.use("/api/cases", require("./routes/cases"));
app.use("/api/users", require("./routes/users"));
app.use("/api/appointments", require("./routes/appointments"));

// Puerto de escucha del servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
