const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const ramSchema = new Schema({
    name: { type: String },

}, { versionKey: false });

module.exports =
    mongoose.models.ram || mongoose.model("ram", ramSchema);
