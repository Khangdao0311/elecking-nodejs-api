const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const reviewSchema = new Schema({
    content: { type: String },
    rating: { type: String },
    creation_date: { type: String },
    updation_date: { type: String },
    user_id
});

module.exports =
    mongoose.models.review || mongoose.model("review", reviewSchema);
