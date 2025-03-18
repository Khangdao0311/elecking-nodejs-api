const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const reviewSchema = new Schema({
    content: { type: String },
    images: [{ type: String }],
    rating: { type: Number },
    created_at: { type: String },
    updated_at: { type: String },
    like: [{ type: ObjectId, ref: "user" }],
    order_id: { type: ObjectId, ref: "order" },
    product_id: { type: ObjectId, ref: "product" },
    user_id: { type: ObjectId, ref: "user" },

}, { versionKey: false });

module.exports =
    mongoose.models.review || mongoose.model("review", reviewSchema);
