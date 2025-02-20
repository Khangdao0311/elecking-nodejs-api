const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const payment_methodSchema = new Schema({
    name: { type: String },
    description: { type: String },
});

module.exports =
    mongoose.models.payment_method || mongoose.model("payment_method", payment_methodSchema);
