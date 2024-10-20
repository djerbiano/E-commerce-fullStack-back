const { handleErrors } = require("../utils/helpers");
const { User } = require("../models/Users");
const Order = require("../models/Order");
const Reclamation = require("../models/Reclamation");
const sendMailReclamationConfirmation = require("../mails/reclamation");
const sendMailContact = require("../mails/contactMail");
const { patch } = require("../routes/reclamation");
const controller = {
  
  reclamationFromUser: async (req, res) => {
    try {
      //Vérification du token
      let compteExiste = await User.findOne({ _id: req.user.id });

      if (!compteExiste) {
       
        return handleErrors(res, 403, {
          message: " Utilisateur inexistant ",
        });
      }
      const { nom, email, message, commande } = req.body;

      // Recherche de la commande
      const order = await Order.findOne({
        trackingNumber: commande,
      });

      // Trouver le User
      const user = await User.findOne({ email: email });

      if (!user || !order) {
        return handleErrors(res, 403, {
          message: " Utilisateur ou numéro de commande inexistant ",
        });
      }

      // s'assurer que le user est le client de la commande
      if (user._id.toString() !== order.user.toString()) {
        return handleErrors(res, 403, {
          message: " Vous devez être le client de la commande ",
        });
      } else {
        // Enregistrer la reclamation dans la base de données
        const reclamation = await Reclamation.find({
          order: order._id,
        });
        if (reclamation.length >= 1) {
          return handleErrors(res, 403, {
            message: " Une réclamation pour cette commande est déjà existante ",
          });
        } else {
          const addReclamation = new Reclamation({
            order: order,

            messages: [
              {
                userId: user._id,
                message: message,
              },
            ],
          });
          const savedOrder = await addReclamation.save();
          console.log(savedOrder);
        }

        // Envoyer le mail à l'utilisateur + admin
        /*  sendMailReclamationConfirmation(email, {
          nom,
          email,
          message,
          commande,
        });
        */
      }

      return handleErrors(res, 200, {
        message: "Votre reclamation a bien été envoyée",
      });
    } catch (error) {
      return handleErrors(res, 400, {
        message: error.message,
      });
    }
  },

  //Contact
  contactFromFormulaire: async (req, res) => {
    try {
      const { nom, email, message } = req.body;

      // Envoyer le mail à l'admin
      sendMailContact(email, { nom, email, message });

      return handleErrors(res, 200, {
        message: "Votre message a bien été envoyé",
      });
    } catch (error) {
      return handleErrors(res, 400, {
        message: error.message,
      });
    }
  },
};

module.exports = controller;
