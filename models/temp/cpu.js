const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const cpuSchema = new Schema({
    name: { type: String },

}, { versionKey: false });

module.exports =
    mongoose.models.cpu || mongoose.model("cpu", cpuSchema);
