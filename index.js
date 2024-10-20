const dotenv = require("dotenv").config();
const express = require("express");
const cors = require("cors");
let ejs = require("ejs");
const port = process.env.PORT || 3002;

const logger = require("./middlewares/logger");
const errMiddleware = require("./middlewares/errMiddleware");
const connectToDb = require("./config/db");
const verifSessionStorage = require("./routes/privateRoute");
const userRoute = require("./routes/users");
const productsRoute = require("./routes/products");
const authRoute = require("./routes/auth");
const orderRoute = require("./routes/order");
const reclamationRoute = require("./routes/contact");
const suiviReclamationRoute = require("./routes/reclamation");

const server = express();
server.use(cors());
server.use(express.json());
server.use("/images", express.static("images"));
// Middleware pour analyser les données URL encodées des formulaires
server.use(express.urlencoded({ extended: true }));
 
// connect to the database
connectToDb();

// Configuration du moteur de vue EJS
server.set("view engine", "ejs");

// Middleware pour enregistrer les informations de la requête
server.use(logger);

// Routes
server.get("/", async (req, res) => {
  try {
    return res.status(200).json({ message: "No access API" });
  } catch (error) {
    return res.status(404).json({ message: error });
  }
});
server.use("/api/auth", authRoute);
server.use("/api", verifSessionStorage);
server.use("/api/users", userRoute);
server.use("/api/products", productsRoute);
server.use("/api/orders", orderRoute);
server.use("/api/contact", reclamationRoute);
server.use("/api/contact/suivi", suiviReclamationRoute);
server.all("*", (req, res) => {
  res.status(404).send("<h1>Endpoint inexistant</h1>");
});

// Middleware pour gérer les erreurs
server.use(errMiddleware);

// Démarrer le serveur
server.listen(port, () => console.log(`Server listening on port ${port}`));
