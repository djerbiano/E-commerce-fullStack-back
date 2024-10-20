const express = require("express");
const controller = require("../controllers/reclamationController");
const virifyToken = require("../middlewares/virifyToken");
const route = express.Router();


// Get all reclamation
route.get("/", virifyToken, controller.getAllReclamation);

// Get one reclamation
route.get("/oneReclamation/:reclamId", virifyToken, controller.getOneReclamation);


// Update Réclamation
route.patch("/:reclamationId", virifyToken, controller.updateReclamation);

// Delete reclamation
route.delete("/delete/:reclamationId", virifyToken, controller.deleteReclamation);

module.exports = route;
