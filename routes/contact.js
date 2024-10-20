const express = require("express");
const controller = require("../controllers/contactController");
const virifyToken = require("../middlewares/virifyToken");
const route = express.Router();



// Contact via formulaire de contact
route.post("/", controller.contactFromFormulaire);

// Réclamation pour une commande
route.post("/reclamation", virifyToken, controller.reclamationFromUser);

module.exports = route;
