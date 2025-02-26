const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const storageSchema = new Schema({
    name: { type: String },

}, { versionKey: false });

module.exports =
    mongoose.models.storage || mongoose.model("storage", storageSchema);
