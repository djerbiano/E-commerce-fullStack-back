const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();

const controller = {
  verifInformationSessionStorage: async (req, res) => {
    try {
      const token = req.headers.token;
      const userId = req.headers.idd;
      if (token) {
        // Vérifier et décoder le token
        const decode = jwt.verify(token, process.env.JWT_SECRET_KEY);

        // Ajouter les informations décodées à l'objet de requête pour une utilisation ultérieure
        req.user = decode;
      } else {
        return res.status(200).json({ message: "false" });
      }
      //Vérification du token
      if (req.user.id !== userId) {
        return res.status(200).json({
          message: "false",
        });
      }
      return res.status(200).json({
        message: "true",
      });
    } catch (error) {
      return res.status(200).json({ message: "false" });
    }
  },
};

module.exports = controller;
