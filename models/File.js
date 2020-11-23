// src/fileModel.js
const { Schema, model } = require("mongoose");
const fileSchema = new Schema({
  filename: String,
  mimetype: String,
  path: String,
});
module.exports = model("File", fileSchema);