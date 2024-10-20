const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();

//Vérifie la validité du token JWT dans les en-têtes

function virifyToken(req, res, next) {
  // Récupérer le token des en-têtes de la requête
  const token = req.headers.token;

  if (!token || token === "null") {
    return res
      .status(401)
      .json({ message: "Veuillez vous inscrire pour vous connecter" });
  }
  if (token) {
    try {
      // Vérifier et décoder le token
      const decode = jwt.verify(token, process.env.JWT_SECRET_KEY);

      // Ajouter les informations décodées à l'objet de requête pour une utilisation ultérieure
      req.user = decode;
      next();
    } catch (error) {
      res.status(401).json({ message: "invalid token" });
    }
  } else {
    res.status(401).json({ message: "no token provided" });
  }
}

module.exports = virifyToken;
