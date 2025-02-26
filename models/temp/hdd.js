const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const hddSchema = new Schema({
    name: { type: String },

}, { versionKey: false });

module.exports =
    mongoose.models.hdd || mongoose.model("hdd", hddSchema);
