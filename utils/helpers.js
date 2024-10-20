const { User } = require("../models/Users");
const path = require("path");
const fs = require("fs");

// Fonction pour supprimer une image
const deleteImage = (filename) => {
  const picture = path.resolve(__dirname, "../images", filename);
  fs.unlink(picture, (err) => {
    if (err) console.log(err);
  });
};

// Fonction pour gérer les erreurs
const handleErrors = (res, statusCode, message) => {
  return res.status(statusCode).json(message);
};

module.exports = { deleteImage, handleErrors };
