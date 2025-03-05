const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const orderProductSchema = new Schema({
    product_id: { type: ObjectId, ref: "product" },
    variant: { type: Number },
    color: { type: Number },
    quantity: { type: Number },
    price: { type: Number },
    status: { type: Boolean }
}, { _id: false, versionKey: false });

const orderSchema = new Schema({
    total: { type: Number },
    status: { type: Number },
    payment_status: { type: Boolean },
    ordered_at: { type: String },
    updated_at: { type: String },
    transaction_code: { type: String },
    price_ship: { type: Number },
    products: [orderProductSchema],
    user_id: { type: ObjectId, ref: "user" },
    voucher_id: { type: ObjectId, ref: "user" },
    payment_method_id: { type: ObjectId, ref: "payment_method" },
    address_id: { type: ObjectId, ref: "address" },
}, { versionKey: false });

module.exports =
    mongoose.models.order || mongoose.model("order", orderSchema);
