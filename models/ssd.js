const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const ssdSchema = new Schema({
    name: { type: String },

}, { versionKey: false });

module.exports =
    mongoose.models.ssd || mongoose.model("ssd", ssdSchema);
