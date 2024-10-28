const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authAdmin = require("../middleware/authAdmin");

router.get("/login", (req, res) => {
  res.render("users/login");
});

router.get("/register", authAdmin, (req, res) => {
  res.render("users/register");
});

router.post("/register", authAdmin, userController.createUser);

router.post("/login", userController.login);
router.get("/logout", userController.logout);
module.exports = router;
