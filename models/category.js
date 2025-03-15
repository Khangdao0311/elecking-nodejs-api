const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const categorySchema = new Schema({
  name: { type: String },
  image: { type: String },
  status: { type: Number },
  icon: { type: String },
  description: { type: String },
  proptypes: [{ type: ObjectId, ref: "proptype" }],
}, { versionKey: false });

module.exports =
  mongoose.models.category || mongoose.model("category", categorySchema);
