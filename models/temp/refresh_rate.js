const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const refresh_rateSchema = new Schema({
    name: { type: String },

}, { versionKey: false });

module.exports =
    mongoose.models.refresh_rate || mongoose.model("refresh_rate", refresh_rateSchema);
