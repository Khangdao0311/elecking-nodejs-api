const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const screen_sizeSchema = new Schema({
    name: { type: String },

}, { versionKey: false });

module.exports =
    mongoose.models.screen_size || mongoose.model("screen_size", screen_sizeSchema);
