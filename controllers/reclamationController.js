const dotenv = require("dotenv").config();
const { User } = require("../models/Users");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Reclamation = require("../models/Reclamation");
const { handleErrors } = require("../utils/helpers");
const sendMailOrderConfirmation = require("../mails/order");
const sendMailOrderStatusUpdate = require("../mails/sendMailOrderStatusUpdate");
const sendMailOrderCancellation = require("../mails/sendMailOrderCancellation");
const controller = {
  // Get all reclamation
  getAllReclamation: async (req, res) => {
    try {
      //Vérification du token
      let compteExiste = await User.findOne({ _id: req.user.id });

      if (compteExiste === null || compteExiste.isAdmin === false) {
        return handleErrors(res, 403, {
          message:
            "Vous devez être un administrateur pour effectuer cette requête",
        });
      }
      const reclamations = await Reclamation.find().populate("order");

      if (reclamations.length > 0) {
        return res.status(200).json(reclamations);
      } else {
        return handleErrors(res, 200, {
          message: "Aucune reclamation n'existe dans la base de données",
        });
      }
    } catch (error) {
      return handleErrors(res, 500, {
        message: `Une erreur est survenue, veuillez reessayer plus tard ${error}`,
      });
    }
  },

  //Get one reclamation
  getOneReclamation: async (req, res) => {
    try {
      //Vérification du token
      let compteExiste = await User.findOne({ _id: req.user.id });
      if (compteExiste === null || compteExiste.isAdmin === false) {
        return handleErrors(res, 403, {
          message:
            "Vous devez être un administrateur pour effectuer cette requête",
        });
      }
      const reclamation = await Reclamation.findOne({
        _id: req.params.reclamId,
      }).populate("order");

      if (reclamation) {
        return res.status(200).json(reclamation);
      } else {
        return handleErrors(res, 404, {
          message: "Aucune reclamation n'existe dans la base de données",
        });
      }
    } catch (error) {
      return handleErrors(res, 500, {
        message: `Une erreur est survenue, veuillez reessayer plus tard ${error}`,
      });
    }
  },
  //Update reclamation
  updateReclamation: async (req, res) => {
    try {
      //Vérification du token
      let compteExiste = await User.findOne({ _id: req.user.id });

      if (compteExiste === null || compteExiste.isAdmin === false) {
        return handleErrors(res, 403, {
          message:
            "Vous devez être un administrateur pour effectuer cette requête",
        });
      }

      const reclamation = await Reclamation.findOne({
        _id: req.params.reclamationId,
      }).populate("order");
      if (reclamation) {
        reclamation.messages.push(req.body);
        reclamation.status = req.body.message;

        const updatedReclamation = await reclamation.save();

        ///////// send mail   //////////

        const user = await User.findById(updatedReclamation.order.user);
        const newStatus = req.body.message;
        sendMailOrderStatusUpdate(user.email, newStatus);

        ///////////////////////////////

        return res.status(200).json(updatedReclamation);
      } else {
        return handleErrors(res, 404, {
          message: "Aucune réclamation n'existe dans la base de données",
        });
      }
    } catch (error) {
      console.log(error);
      return handleErrors(res, 400, {
        message: error.message,
      });
    }
  },

  //Delete reclamation
  deleteReclamation: async (req, res) => {
    try {
      //Vérification du token
      let compteExiste = await User.findOne({ _id: req.user.id });

      if (compteExiste === null || compteExiste.isAdmin === false) {
        return handleErrors(res, 403, {
          message:
            "Vous devez être un administrateur pour effectuer cette requête",
        });
      }

      const reclamation = await Reclamation.findOne({
        _id: req.params.reclamationId,
      }).populate("order");

      if (reclamation) {
        await Reclamation.findByIdAndDelete(reclamation._id);

        return handleErrors(res, 200, {
          message: "La réclamation a bien été supprimée",
        });
      } else {
        return handleErrors(res, 404, {
          message: "Aucune réclamation n'existe dans la base de données",
        });
      }
    } catch (error) {
      return handleErrors(res, 400, {
        message: error.message,
      });
    }
  },
};

module.exports = controller;
