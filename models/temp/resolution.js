const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const resolutionSchema = new Schema({
    name: { type: String },

}, { versionKey: false });

module.exports =
    mongoose.models.resolution || mongoose.model("resolution", resolutionSchema);
