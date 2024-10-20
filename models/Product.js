const mongoose = require("mongoose");

const ProductsSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    regularPrice: {
      type: Number,
      required: true,
    },
    isOnSale: {
      type: Boolean,
      default: false,
    },
    salePrice: {
      type: Number,
      default: 0,
    },
    isTopSeller: {
      type: Boolean,
      default: false,
    },
    isNewCollection: {
      type: Boolean,
      default: true,
    },
    isLimitedEdition: {
      type: Boolean,
      default: false,
    },
    description: {
      desc1: {
        type: String,
        required: true,
      },
      desc2: {
        type: String,
        required: true,
      },
      desc3: {
        type: String,
        required: true,
      },
    },
    pictures: {
      pic1: {
        type: String,
        default: "avatarDefault.jpg",
        required: true,
      },
      pic2: {
        type: String,
        default: "avatarDefault.jpg",
        required: true,
      },
      pic3: {
        type: String,
        default: "avatarDefault.jpg",
        required: true,
      },
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Homme",
        "Femme",
        "Informatique",
        "TvSon",
        "Téléphonie",
        "ObjetsConnectés",
      ],
    },
    stock: {
      type: Boolean,
      default: true,
    },
    colors: [
      {
        color: {
          type: String,
          required: true,
        },
        sizes: [
          {
            size: {
              type: String,
              required: true,
            },
            quantity: {
              type: Number,
              default: 0,
              required: true,
            },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", ProductsSchema);  
module.exports = Product;
              