const mongoose = require("mongoose");
const joi = require("joi");
const Product = require("../models/Product");

const UsersSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 100,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    validateEmail: {
      type: Boolean,
      default: false,
    },
    avatar: {
      type: String,
      default: "avatarDefault.jpg",
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 6,
    },
    verifyProfile: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    favoritesProduct: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  { timestamps: true }
);

const User = mongoose.model("User", UsersSchema);

// validate Register user
function validateRegisterUser(obj) {
  const schema = joi.object({
    email: joi.string().trim().min(5).max(100).required().email(),
    password: joi.string().trim().min(6).required(),
    name: joi.string().trim().min(4).max(100),
    lastName: joi.string().trim().min(4).max(100),
    phone: joi.string().trim().min(5).max(100),
    address: joi.string().trim().min(5).max(100),
  });
  return schema.validate(obj);
}
// validate new email
function validateNewMail(obj) {
  const schema = joi.object({
    email: joi.string().trim().min(5).max(100).email(),
  });
  return schema.validate(obj);
}
// validate new password
function validateNewPassword(obj) {
  const schema = joi.object({
    password: joi.string().trim().min(6),
  });
  return schema.validate(obj);
}

// validate login user
function validateLoginUser(obj) {
  const schema = joi.object({
    email: joi.string().trim().min(5).max(100).required().email(),
    password: joi.string().trim().min(6).required(),
  });
  return schema.validate(obj);
}

module.exports = {
  User,
  validateRegisterUser,
  validateNewPassword,
  validateNewMail,
  validateLoginUser,
};
