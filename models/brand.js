const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const brandSchema = new Schema({
  name: { type: String },
  logo: { type: String },
  banner: { type: String },
  status: { type: Number },
  description: { type: String },
}, { versionKey: false });

module.exports =
  mongoose.models.brand || mongoose.model("brand", brandSchema);
