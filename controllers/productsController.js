const dotenv = require("dotenv").config();
const { User } = require("../models/Users");
const Product = require("../models/Product");
const { deleteImage, handleErrors } = require("../utils/helpers");
const controller = {
  //Get all products
  getAllProducts: async (req, res) => {
    try {
      const products = await Product.find();

      if (products.length > 0) {
        return res.status(200).json(products);
      } else {
        return handleErrors(res, 200, {
          message: "Aucun produit n'existe dans la base de données",
        });
      }
    } catch (error) {
      return handleErrors(res, 400, {
        message: error.message,
      });
    }
  },
  pagination: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 1;

      if (page < 1 || limit < 1) {
        page = 1;
        limit = 1;
      }
      const startIndex = (page - 1) * limit;

      const products = await Product.find().skip(startIndex).limit(limit);

      const totalCount = await Product.countDocuments();
      const totalPages = Math.ceil(totalCount / limit);

      const results = {
        currentPage: page,
        totalPages: totalPages,
        totalCount: totalCount,
        products: products,
      };

      if (products.length > 0) {
        return res.status(200).json(results);
      } else {
        return handleErrors(res, 200, {
          message: "Aucun produit n'existe dans la base de données",
        });
      }
    } catch (error) {
      console.log(error);
      return handleErrors(res, 400, {
        message: error.message,
      });
    }
  },

  //Get one product
  getOneProduct: async (req, res) => {
    try {
      const products = await Product.find({
        title: { $regex: new RegExp(req.params.oneProduct, "i") },
      });

      if (products.length > 0) {
        return res.status(200).json(products);
      } else {
        return handleErrors(res, 404, {
          message: ` ${req.params.oneProduct} n'existe pas`,
        });
      }
    } catch (error) {
      return handleErrors(res, 400, {
        message: error.message,
      });
    }
  },

  //Get one product by id
  getOneProductById: async (req, res) => {
    try {
      const products = await Product.findOne({ _id: req.params.byId });

      if (products) {
        return res.status(200).json(products);
      } else {
        return handleErrors(res, 404, {
          message: ` ${req.params.byId} n'existe pas`,
        });
      }
    } catch (error) {
      return handleErrors(res, 400, {
        message: error.message,
      });
    }
  },

  //Add product
  addProduct: async (req, res) => {
    let images;
    try {
      let compteExiste = await User.findOne({ _id: req.user.id });
      // Vérification du token
      if (compteExiste === null || compteExiste.isAdmin === false) {
        return handleErrors(res, 403, {
          message:
            "Vous devez être un administrateur pour effectuer cette requête",
        });
      }
      if (req.files.length === 0 || req.files.length < 3) {
        return handleErrors(res, 400, {
          message: "Les photos sont obligatoires",
        });
      }

      const {
        title,
        regularPrice,
        isOnSale,
        salePrice,
        isTopSeller,
        isNewCollection,
        isLimitedEdition,
        desc1,
        desc2,
        desc3,
        category,
        color1,
        sizes,
        quantity1,
        color2,
        sizes2,
        quantity2,
      } = req.body;

      images = req.files;

      const newProduct = new Product({
        title,
        regularPrice,
        isOnSale,
        salePrice,
        isTopSeller,
        isNewCollection,
        isLimitedEdition,
        description: {
          desc1: desc1,
          desc2: desc2,
          desc3: desc3,
        },
        pictures: {
          pic1: images[0].filename,
          pic2: images[1].filename,
          pic3: images[2].filename,
        },
        category,

        colors: [
          {
            color: color1,
            sizes: [
              {
                size: sizes,
                quantity: quantity1,
              },
            ],
          },

          /* {
            color: color2,
            sizes: [
              {
                size: sizes2,
                quantity: quantity2,
              },
            ],
          },*/
        ],
      });

      const savedProduct = await newProduct.save();

      if (savedProduct) {
        return res.status(200).json(savedProduct);
      } else {
        deleteImage(images[0].filename);
        deleteImage(images[1].filename);
        deleteImage(images[2].filename);
        return handleErrors(res, 404, {
          message: "Impossible d'ajouter le produit",
        });
      }
    } catch (error) {
      deleteImage(images[0].filename);
      deleteImage(images[1].filename);
      deleteImage(images[2].filename);
      return handleErrors(res, 400, {
        message: error.message,
      });
    }
  },

  //Update product
  updateProduct: async (req, res) => {
    try {
      //Vérification du token
      let compteExiste = await User.findOne({ _id: req.user.id });
      if (compteExiste === null || compteExiste.isAdmin === false) {
        return handleErrors(res, 403, {
          message:
            "Vous devez être un administrateur pour effectuer cette requête",
        });
      }

      const updateProd = await Product.findOne({
        _id: req.params.product,
      });

      if (!updateProd) {
        return handleErrors(res, 404, {
          message: ` Le produit n'existe pas`,
        });
      } else {
        if (Object.keys(req.body).length === 0) {
          return handleErrors(res, 400, {
            message: "Vous n'avez rempli aucun champ",
          });
        }

        const allowedFields = [
          "title",
          "regularPrice",
          "isOnSale",
          "salePrice",
          "isTopSeller",
          "isNewCollection",
          "isLimitedEdition",
          "desc1",
          "desc2",
          "desc3",
          "category",
          "stock",
          "color",
          "color1",
          "size",
          "quantity",
        ];
      
        for (const field of allowedFields) {
          if (req.body[field] !== undefined) {
            if (req.body.quantity1 !== undefined) {
              if (
                updateProd.colors.length === 1 &&
                updateProd.colors[0].sizes.length === 1
              ) {
                updateProd.colors[0].sizes[0].quantity = parseInt(
                  req.body.quantity1
                );
                updateProd.colors[0].color = req.body.color1;
                if (req.body.sizes.length > 0) {
                  updateProd.colors[0].sizes[0].size = req.body.sizes;
                }
              }
            }
            updateProd.description = {
              desc1: req.body.desc1 || updateProd.description.desc1,
              desc2: req.body.desc2 || updateProd.description.desc2,
              desc3: req.body.desc3 || updateProd.description.desc3,
            };
            updateProd[field] = req.body[field];
          }
        }
      }

      const savedProduct = await updateProd.save();

      return res.status(200).json(savedProduct);
    } catch (error) {
      return handleErrors(res, 400, {
        message: error.message,
      });
    }
  },

  //Delete product
  deleteProduct: async (req, res) => {
    try {
      //Vérification du token
      let compteExiste = await User.findOne({ _id: req.user.id });
      if (compteExiste === null || compteExiste.isAdmin === false) {
        return handleErrors(res, 403, {
          message:
            "Vous devez être un administrateur pour effectuer cette requête",
        });
      }

      const deleteProd = await Product.findOne({
        _id: req.params.productDelete,
      });

      if (!deleteProd) {
        return handleErrors(res, 404, {
          message: ` Le produit n'existe pas`,
        });
      } else {
        // supprimer les photos du produit
        const deletePhoto = Object.values(await deleteProd.pictures);
        for (const photo of deletePhoto) {
          if (photo !== "avatarDefault.jpg") {
            deleteImage(photo);
          }
        }

        // Supprimer le produit
        await Product.findOneAndDelete({
          _id: req.params.productDelete,
        });

        return handleErrors(res, 200, {
          message: "Le produit a bien été supprimé",
        });
      }
    } catch (error) {
      return handleErrors(res, 400, {
        message: error.message,
      });
    }
  },

  //Ajouter un article dans la liste de favoris
  addFavorite: async (req, res) => {
    try {
      //Vérification du token
      const user = await User.findOne({ _id: req.user.id });

      if (!user) {
        return handleErrors(res, 200, {
          message: ` Veuillez vous inscrire pour pouvoir ajouter des produits dans votre liste`,
        });
      }

      const product = await Product.findOne({ _id: req.params.favo });

      if (!product) {
        return handleErrors(res, 200, {
          message: ` Le produit n'existe pas`,
        });
      }
      const favoriteList = await user.favoritesProduct;
      const productInList = req.params.favo;
      if (favoriteList.includes(productInList)) {
        return handleErrors(res, 200, {
          message: ` L'article est déjà dans votre liste de favoris`,
        });
      }

      favoriteList.push(product._id);
      await user.save();

      return handleErrors(res, 200, {
        message: "Le produit a bien éte ajouté dans la liste de favoris",
      });
    } catch (error) {
      return handleErrors(res, 400, {
        message: error.message,
      });
    }
  },

  //Supprimer un article de la liste de favoris
  deleteFavorite: async (req, res) => {
    try {
      //Vérification du token
      const user = await User.findOne({ _id: req.user.id });

      if (!user) {
        return handleErrors(res, 200, {
          message: ` Veuillez vous inscrire pour pouvoir supprimmer des produits de votre liste`,
        });
      }

      const product = await Product.findOne({ _id: req.params.delFavo });

      if (!product) {
        return handleErrors(res, 404, {
          message: ` Le produit n'existe pas`,
        });
      }

      const favoriteList = await user.favoritesProduct;
      const deleteProductInList = req.params.delFavo;

      if (!favoriteList.includes(deleteProductInList)) {
        return handleErrors(res, 400, {
          message: ` L'article n'est pas dans votre liste`,
        });
      }

      const indexProductToDelete = favoriteList.indexOf(deleteProductInList);

      favoriteList.splice(indexProductToDelete, 1);

      await user.save();

      return handleErrors(res, 200, {
        message: "Le produit a bien éte supprimé",
      });
    } catch (error) {
      return handleErrors(res, 400, {
        message: error.message,
      });
    }
  },
};

module.exports = controller;
