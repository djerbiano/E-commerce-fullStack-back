const express = require("express");
const productsController = require("../controllers/productsController");
const virifyToken = require("../middlewares/virifyToken");
const mult = require("../middlewares/multer");
const multerMultiple = require("../middlewares/multerMultiple");
const route = express.Router();

//Get all products
route.get("/", productsController.getAllProducts);
//Paginations
route.get("/paginationProducts", productsController.pagination);

//Get one product
route.get("/:oneProduct", productsController.getOneProduct);

//Get one product by id
route.get("/oneProduct/:byId", productsController.getOneProductById);

//Add product
route.post("/addProduct", virifyToken, multerMultiple, productsController.addProduct);

//Update product
route.patch("/updateProduct/:product",virifyToken,productsController.updateProduct);

//Delete product
route.delete("/deleteProduct/:productDelete",virifyToken,productsController.deleteProduct
);

//Add FavoritesProducts
route.post("/addFavoritesProducts/:favo",virifyToken,productsController.addFavorite);

//Delete FavoritesProducts
route.delete("/deleteFavoritesProducts/:delFavo",virifyToken,productsController.deleteFavorite);
//Paginations
route.get("/paginationProducts", productsController.pagination);


module.exports = route;