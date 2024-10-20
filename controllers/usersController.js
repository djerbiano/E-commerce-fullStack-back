const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();
const fs = require("fs");
const path = require("path");
const {
  User,
  validateRegisterUser,
  validateNewPassword,
  validateNewMail,
  validateLoginUser,
} = require("../models/Users");
const { deleteImage, handleErrors } = require("../utils/helpers");
const sendMailCreateCompte = require("../mails/register");

const controller = {
  // Get all users
  getAll: async (req, res) => {
    try {
      let compteExiste = await User.findOne({ _id: req.user.id });
      //Vérification du token
      if (compteExiste === null || compteExiste.isAdmin === false) {
        return handleErrors(res, 403, {
          message:
            "Vous devez être un administrateur pour effectuer cette requête",
        });
      }
      const users = await User.find({});

      if (users.length > 0) {
        let transformedUsers = users.map((user) => {
          // Exclure certaines propriétés du document utilisateur
          let { password, updatedAt, __v, ...other } = user._doc;
          return other;
        });

        return res.status(200).send(transformedUsers);
      } else {
        return handleErrors(res, 404, {
          message: "Empty DB",
        });
      }
    } catch (error) {
      return handleErrors(res, 400, {
        message: error.message,
      });
    }
  },

  // Get one user
  getOne: async (req, res) => {
    try {
      let compteExiste = await User.findOne({ _id: req.user.id });
      //Vérification du token
      if (compteExiste === null || compteExiste.isAdmin === false) {
        return handleErrors(res, 403, {
          message:
            "Vous devez être un administrateur pour effectuer cette requête",
        });
      }

      const userInDB = await User.findOne({ email: req.params.email });
      if (!userInDB) {
        return handleErrors(res, 404, {
          message: `${req.params.email} n'existe pas dans la DB`,
        });
      } else {
        // Exclure certaines propriétés du document utilisateur
        let { password, updatedAt, __v, ...other } = userInDB._doc;

        return res.status(200).send(other);
      }
    } catch (error) {
      return handleErrors(res, 400, {
        message: error.message,
      });
    }
  },

  //search user
  searchUser: async (req, res) => {
    try {
      let compteExiste = await User.findOne({ _id: req.user.id });
      //Vérification du token
      if (compteExiste === null || compteExiste.isAdmin === false) {
        return handleErrors(res, 403, {
          message:
            "Vous devez être un administrateur pour effectuer cette requête",
        });
      }
      const users = await User.find({
        email: { $regex: new RegExp(req.params.searchUser, "i") },
      });

      if (users.length > 0) {
        const filteredUsers = users.map((user) => {
          const { password, updatedAt, __v, ...other } = user._doc;
          return other;
        });

        return res.status(200).json(filteredUsers);
      } else {
        return handleErrors(res, 200, {
          message: ` - ${req.params.searchUser} - n'existe pas`,
        });
      }
    } catch (error) {
      return handleErrors(res, 400, {
        message: error.message,
      });
    }
  },

  // Register user
  registerUser: async (req, res) => {
    try {
      const { error } = validateRegisterUser(req.body);

      if (error) {
        if (req.file) {
          deleteImage(req.file.filename);
        }
        return handleErrors(res, 400, {
          message: error.details[0].message,
        });
      }

      // Vérifier si l'e-mail existe déjà
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        if (req.file) {
          deleteImage(req.file.filename);
        }
        return handleErrors(res, 400, {
          message: "Merci de saisir une autre adresse e-mail",
        });
      }

      // Hacher le mot de passe avant de l'enregistrer
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password.trim(), salt);

      if (req.file === undefined) {
        user = new User(req.body);
      } else {
        user = new User(req.body);
      }
      // ps  : avant le déploiement, la photo a prendre en compte
      /* if (req.file === undefined) {
        user = new User({
          email: req.body.email,
          password: req.body.password,
        });
      } else {
        user = new User({
          email: req.body.email,
          password: req.body.password,
          avatar: req.file.filename,
        });
      }*/

      // Enregistrer l'utilisateur dans la base de données
      const result = await user.save();

      // Générer un token JWT pour l'utilisateur
      const token = jwt.sign(
        { id: user._id, isAdmin: user.isAdmin, email: user.email },
        process.env.JWT_SECRET_KEY,
        {
          expiresIn: "5h",
        }
      );

      // Exclure certaines propriétés du document résultant
      const { password, updatedAt, __v, ...other } = result._doc;

      // envoyer un mail de Bienvenue
      sendMailCreateCompte(req.body.email);

      res
        .status(201)
        .json([
          { message: `${result.email} votre compte a bien être créé` },
          { ...other },
          { token },
        ]);
    } catch (error) {
      if (req.file) {
        deleteImage(req.file.filename);
      }
      return handleErrors(res, 400, {
        message: error.message,
      });
    }
  },

  // login user
  loginUser: async (req, res) => {
    try {
      const { error } = validateLoginUser(req.body);

      if (error) {
        return handleErrors(res, 400, {
          message: error.details[0].message,
        });
      }

      // Vérifier si l'utilisateur existe
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        // Vérifier si le mot de passe correspond
        const isPasswordMatch = await bcrypt.compare(
          req.body.password.trim(),
          user.password
        );

        if (user && isPasswordMatch) {
          // Générer un token JWT pour l'utilisateur
          const token = jwt.sign(
            { id: user._id, isAdmin: user.isAdmin, email: user.email },
            process.env.JWT_SECRET_KEY,
            {
              expiresIn: "5h",
            }
          );
          const { password, updatedAt, __v, ...other } = user._doc;
          return res
            .status(200)
            .json([
              { message: ` ${user.email} vous êtes bien connecté` },
              { ...other },
              { token },
            ]);
        } else {
          return handleErrors(res, 401, {
            message: "Vous avez saisi un email ou mot de passe incorrect",
          });
        }
      } else {
        return handleErrors(res, 401, {
          message: "Un problème est survenu, veuillez réessayer",
        });
      }
    } catch (error) {
      return handleErrors(res, 400, {
        message: error.message,
      });
    }
  },

  // Update user
  updateUser: async (req, res) => {
    try {
      let compteExiste = await User.findOne({ _id: req.user.id });

      // Vérification du token
      if (compteExiste === null || compteExiste.isAdmin === false) {
        return handleErrors(res, 403, {
          message:
            "Vous devez être un administrateur pour effectuer cette requête",
        });
      }

      let user = await User.findOne({ email: req.params.updateUser });

      if (!user) {
        if (req.file) {
          deleteImage(req.file.filename);
        }

        return handleErrors(res, 404, {
          message: "Profile non trouvé",
        });
      }

      let updateFields = {};

      if (req.body.password) {
        const { error: passwordError } = validateNewPassword({
          password: req.body.password,
        });

        if (passwordError) {
          return handleErrors(res, 400, {
            message: passwordError.details[0].message,
          });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(
          req.body.password.trim(),
          salt
        );
        updateFields.password = hashedPassword;
      }

      if (req.body.email) {
        const { error: emailError } = validateNewMail({
          email: req.body.email,
        });

        if (emailError) {
          return handleErrors(res, 400, {
            message: emailError.details[0].message,
          });
        }

        updateFields.email = req.body.email;
      }

      if (req.file) {
        // Supprimer l'ancien avatar
        if (user.avatar !== "avatarDefault.jpg") {
          deleteImage(user.avatar);
        }

        updateFields.avatar = req.file.filename;
      }

      if (Object.keys(updateFields).length === 0) {
        return handleErrors(res, 400, {
          message: "Veuillez renseigner au moins un champ",
        });
      }

      await User.updateOne({ email: req.params.updateUser }, updateFields);

      return handleErrors(res, 200, {
        message: "Le profil a bien été mis à jour",
      });
    } catch (error) {
      return handleErrors(res, 400, {
        message: error.message,
      });
    }
  },
  // Supprimer un utilisateur
  deleteUser: async (req, res) => {
    try {
      let compteExiste = await User.findOne({ _id: req.user.id });
      //Vérification du token
      if (compteExiste === null || compteExiste.isAdmin === false) {
        return handleErrors(res, 403, {
          message:
            "Vous devez être un administrateur pour effectuer cette requête",
        });
      }

      const userPicture = await User.findOne({ email: req.params.deleteUser });

      // supprimer la photo de user

      const photo = userPicture.avatar;

      if (photo !== "avatarDefault.jpg") {
        deleteImage(photo);
      }

      // Supprimer l'utilisateur et laisser les commandes pour pouvoir les récupérer si le user s'inscrit de nouveau
      setTimeout(async () => {
        await User.findOneAndDelete({
          email: req.params.deleteUser,
        });
        return handleErrors(res, 200, {
          message: "Le compte a bien été supprimé",
        });
      }, 2000);
    } catch (error) {
      return handleErrors(res, 400, {
        message: error.message,
      });
    }
  },

  //Get favoritesProductes
  getFavoritesProducts: async (req, res) => {
    try {
      //Vérification du token
      const user = await User.findOne({ _id: req.user.id }).populate(
        "favoritesProduct"
      );

      if (!user) {
        return handleErrors(res, 200, {
          message:
            "Veuillez vous inscrire pour pouvoir ajouter des produits dans votre liste",
        });
      }

      const favorites = await user.favoritesProduct;

      if (favorites.length > 0) {
        return res.status(200).send(favorites);
      } else {
        return handleErrors(res, 200, {
          message: "Vous n'avez aucun article dans votre liste",
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
