const express = require("express");
const controller = require("../controllers/privateRouteController");
const route = express.Router();

// Private route

route.post(
  "/verifInformationSessionStorage",
  controller.verifInformationSessionStorage
);

module.exports = route;
