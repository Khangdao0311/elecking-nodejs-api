const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const propertySchema = new Schema({
  name: { type: String },
  type: { type: String },
  category_id: { type: ObjectId, ref: "category" },

}, { versionKey: false });

module.exports =
  mongoose.models.property || mongoose.model("property", propertySchema);
