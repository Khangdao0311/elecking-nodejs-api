const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const categorySchema = new Schema({
  name: { type: String },
  image: { type: String },
  status: { type: Number },
  description: { type: String },
  properties: [{ type: String }],
}, { versionKey: false });

module.exports =
  mongoose.models.category || mongoose.model("category", categorySchema);
