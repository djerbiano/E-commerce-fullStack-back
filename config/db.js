const mongoose = require("mongoose");
const dotenv = require("dotenv").config();

const url = process.env.URL_DB_LOCAL;
const dbName = process.env.DB_NAME;

const connectToDb = async () => {
  try {
    await mongoose.connect(`${url}/${dbName}`);
    console.log(`connected to the ${dbName} database`);
  } catch (error) {
    console.log(`Connection DB error : ${error}`);
  }
};

module.exports = connectToDb;
