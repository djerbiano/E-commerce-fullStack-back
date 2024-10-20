const express = require("express");
const controller = require("../controllers/usersController");
const passwordController = require("../controllers/passwordController");
const route = express.Router();
const mult = require("../middlewares/multer");

// Register user

route.post("/register", mult, controller.registerUser);

// Login user

route.post("/login", controller.loginUser);

//Reset password
route.get("/password", passwordController.showForgotPasswordPage);
route.post("/password", passwordController.sendResetPasswordLink);

//Set reset password
route.get(
  "/setResetPassword/:id/:token",
  passwordController.showResetPasswordForm
);

//Save reset password
route.post(
  "/setResetPassword/:id/:token",
  passwordController.saveResetPassword
);

//VerifIsAdmin
route.get("/verifIsAdmin", passwordController.verifIsAdmin);

module.exports = route;
