const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const proptypeSchema = new Schema({
  name: { type: String },

}, { versionKey: false });

module.exports =
  mongoose.models.proptype || mongoose.model("proptype", proptypeSchema);
