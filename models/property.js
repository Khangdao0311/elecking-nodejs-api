const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const propertySchema = new Schema({
  name: { type: String },
  type: { type: String },

}, { versionKey: false });

module.exports =
  mongoose.models.property || mongoose.model("property", propertySchema);
