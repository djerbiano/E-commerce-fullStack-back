const dotenv = require("dotenv").config();
const { User } = require("../models/Users");
const Product = require("../models/Product");
const Order = require("../models/Order");
const { handleErrors } = require("../utils/helpers");
const sendMailOrderConfirmation = require("../mails/order");
const sendMailOrderStatusUpdate = require("../mails/sendMailOrderStatusUpdate");
const sendMailOrderCancellation = require("../mails/sendMailOrderCancellation");
const sendMailOrderConfirmationByClient = require("../mails/sendMailConfirmeReceptionByClient");
const controller = {
  //Get all order
  getAllOrder: async (req, res) => {
    try {
      //Vérification du token
      let compteExiste = await User.findOne({ _id: req.user.id });

      if (compteExiste === null || compteExiste.isAdmin === false) {
        return handleErrors(res, 403, {
          message:
            "Vous devez être un administrateur pour effectuer cette requête",
        });
      }

      const orders = await Order.find().populate("products.product");

      if (orders.length > 0) {
        return res.status(200).json(orders);
      } else {
        return handleErrors(res, 200, {
          message: "Aucune commande n'existe dans la base de données",
        });
      }
    } catch (error) {
      return handleErrors(res, 400, {
        message: error.message,
      });
    }
  },

  //Get all order by user
  getAllOrderByUser: async (req, res) => {
    try {
      //Vérification du token
      if (req.user.isAdmin === false){
        if (req.user.email !== req.params.email) {
          return res.status(403).json({
            message: "Token non valide, veuillez vous reconnecter",
          });
        }
      }
    
      const orders = await Order.find({ email: req.params.email }).populate({
        path: "products.product",
        select: "title pictures",
      });
      if (orders.length > 0) {
        return res.status(200).json(orders);
      } else {
        return handleErrors(res, 200, {
          message: "Vous n'avez pas encore de commande",
        });
      }
    } catch (error) {
      return handleErrors(res, 400, {
        message: error.message,
      });
    }
  },

  //Get one order by trackingNumber
  getOneOrder: async (req, res) => {
    try {
      //Vérification du token
      let compteExiste = await User.findOne({ _id: req.user.id });

      if (compteExiste === null || compteExiste.isAdmin === false) {
        return handleErrors(res, 403, {
          message:
            "Vous devez être un administrateur pour effectuer cette requête",
        });
      }

      const order = await Order.findOne({
        trackingNumber: req.params.trackingNumber,
      })

      if (order) {
        return res.status(200).json(order);
      } else {
        return handleErrors(res, 200, {
          message: "Aucune commande n'existe dans la base de données",
        });
      }
    } catch (error) {
      return handleErrors(res, 400, {
        message: error.message,
      });
    }
  },

  //Add order
  addOrder: async (req, res) => {
    try {
      // Vérification du token
      if (req.user.id !== req.params.userId) {
        return res.status(403).json({
          message: "Token non valide, veuillez vous reconnecter",
        });
      }

      const user = await User.findById(req.user.id);
      if (!user) {
        return handleErrors(res, 200, {
          message: "Veuillez vous inscrire pour passer commande",
        });
      }

      if (req.body.products.length === 0) {
        return handleErrors(res, 200, {
          message: "Veuillez ajouter au moins un produit",
        });
      }

      // Recherche des produits commandés dans la base de données
      for (let i = 0; i < req.body.products.length; i++) {
        const { product, color, size, quantity } = req.body.products[i];
        const productInDb = await Product.findById(product);

        if (!productInDb) {
          return handleErrors(res, 404, {
            message: ` Un des produits de votre panier est en rupture de stock`,
          });
        }
        let quantityAvailable = false;

        for (const colorObj of productInDb.colors) {
          if (colorObj.color === color) {
            for (const sizeObj of colorObj.sizes) {
              if (sizeObj.size === size && sizeObj.quantity >= quantity) {
                quantityAvailable = true;
                break;
              }
            }
            if (quantityAvailable) {
              break;
            }
          }
        }

        if (!quantityAvailable) {
          return handleErrors(res, 404, {
            message:
              "La quantité ou la couleur demandée pour le produit est indisponible en stock",
          });
        }
      }

      const order = new Order({
        products: req.body.products,
        title: req.body,
        user: req.user.id,
        email: req.user.email,
        total: req.body.total,
        billingAddress: req.body.billingAddress || req.body.shippingAddress,
        shippingAddress: req.body.shippingAddress,
        statusHistory: [
          {
            status: "payée",
            startDate: new Date(),
          },
        ],
      });
      const savedOrder = await order.save();

      if (savedOrder) {
        // sauvegarder le stock après la mise à jour de la commande
        for (let i = 0; i < req.body.products.length; i++) {
          const { product, quantity, color, size } = req.body.products[i];
          const productInDb = await Product.findById(product);
          for (const colorObj of productInDb.colors) {
            if (colorObj.color === color) {
              for (const sizeObj of colorObj.sizes) {
                if (sizeObj.size === size) {
                  sizeObj.quantity -= quantity;

                  if (sizeObj.quantity <= 0) {
                    productInDb.stock = false;
                  }

                  await productInDb.save();
                }
              }
            }
          }
        }

        ///////// send mail   //////////

        const orderDetails = {
          products: req.body.products,
          total: req.body.total,
          billingAddress: req.body.billingAddress || req.body.shippingAddress,
          shippingAddress: req.body.shippingAddress,
        };
        sendMailOrderConfirmation(user.email, orderDetails);

        ///////////////////////////////

        return res.status(200).json(savedOrder);
      } else {
        return handleErrors(res, 404, {
          message: "Impossible d'ajouter la commande",
        });
      }
    } catch (error) {
      return handleErrors(res, 400, {
        message: error.message,
      });
    }
  },

  //Update order
  updateOrder: async (req, res) => {
    try {
      //Vérification du token
      let compteExiste = await User.findOne({ _id: req.user.id });

      if (compteExiste === null || compteExiste.isAdmin === false) {
        return handleErrors(res, 403, {
          message:
            "Vous devez être un administrateur pour effectuer cette requête",
        });
      }

      const order = await Order.findOne({
        trackingNumber: req.params.orderTrackingNumber,
      });

      if (order) {
        order.status = req.body.status || order.status;
        if (req.body.statusHistory) {
          order.statusHistory.push(...req.body.statusHistory);
        }

        const updatedOrder = await order.save();

        ///////// send mail   //////////

        const user = await User.findById(updatedOrder.user);
        const newStatus = req.body.status;
        sendMailOrderStatusUpdate(user.email, newStatus);

        ///////////////////////////////

        return res.status(200).json(updatedOrder);
      } else {
        return handleErrors(res, 404, {
          message: "Aucune commande n'existe dans la base de données",
        });
      }
    } catch (error) {
      return handleErrors(res, 400, {
        message: error.message,
      });
    }
  },

  //Confirme réception commande by client
  confirmReception: async (req, res) => {
    try {
      //Vérification du token
      let user = await User.findOne({ _id: req.user.id });
      let orderId = await Order.findOne({ _id: req.params.orderId });

      if (user === null || orderId === null) {
        return handleErrors(res, 403, {
          message: "Commande inconnue",
        });
      }

      if (user._id.toString() !== orderId.user.toString()) {
        return handleErrors(res, 403, {
          message: "Vous devez étre connecté pour effectuer cette demande, (Il s'agit peut-être d'une ancienne commande passer par votre premier compte).",
        });
      }

      if (orderId.status === "reçue") {
        return handleErrors(res, 200, {
          message: "La commande est déjà reçue",
        });
      }

      if (orderId.status === "payée") {
        return handleErrors(res, 200, {
          message: "La commande n'est pas encore livrée",
        });
      }

      orderId.status = "reçue";
      orderId.statusHistory.push({
        status: "reçue",
        startDate: new Date(),
      });

      let savedOrder = await orderId.save();

      ///////// send mail   //////////
      sendMailOrderConfirmationByClient(user.email);
      /////////////////////////////////////

      return res.status(200).json({
        message: "Merci d'avoir confirmer votre commande",
      });
    } catch (error) {
      return handleErrors(res, 400, {
        message: error.message,
      });
    }
  },

  //Delete order
  deleteOrder: async (req, res) => {
    try {
      //Vérification du token
      let compteExiste = await User.findOne({ _id: req.user.id });

      if (compteExiste === null || compteExiste.isAdmin === false) {
        return handleErrors(res, 403, {
          message:
            "Vous devez être un administrateur pour effectuer cette requête",
        });
      }

      const order = await Order.findOne({
        trackingNumber: req.params.orderDeleteTrackingNumber,
      });

      if (order) {
        await Order.findByIdAndDelete(order._id);

        ///////// send mail   //////////

        const user = await User.findById(order.user);
        sendMailOrderCancellation(user.email);

        ///////////////////////////////

        return handleErrors(res, 200, {
          message: "La commande a bien été supprimée",
        });
      } else {
        return handleErrors(res, 404, {
          message: "Aucune commande n'existe dans la base de données",
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
