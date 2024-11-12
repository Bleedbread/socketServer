const express = require("express");
const mongoose = require("mongoose");
require('dotenv').config();
const cors = require("cors");

const app = express();
app.use(cors());

mongoose.connect(process.env.DB)
  .then(() => console.log("Connected to database"))
  .catch((err) => console.error("Database connection error:", err));

module.exports = app;
