const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
require("dotenv").config();
const path = require("path");

const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.set("view engine", "ejs");

app.use(
  session({
    secret: "mysecretkey",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

app.get("/", (req, res) => {
  res.redirect("/api/cases");
});

app.use("/api/cases", require("./routes/cases"));
app.use("/api/users", require("./routes/users"));
app.use("/api/appointments", require("./routes/appointments"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
