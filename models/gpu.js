const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const gpuSchema = new Schema({
    name: { type: String },

}, { versionKey: false });

module.exports =
    mongoose.models.gpu || mongoose.model("gpu", gpuSchema);
