const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const wishSchema = new Schema({

    total: { type: Number },
    status: { type: Number },
    order_date: { type: String },
    transaction_code: { type: Number },
    price_ship: { type: Number },
    products: [
        {
            product_id: { type: ObjectId, ref: "product" },
            variant: { type: Number },
            color: { type: Number },
            quantity: { type: Number }
        }
    ],
    user_id: { type: ObjectId, ref: "user" },
    voucher_id: { type: ObjectId, ref: "user" },
    payment_method_id: { type: ObjectId, ref: "payment_method" },
    address_id: { type: ObjectId, ref: "address" },
});

module.exports =
    mongoose.models.wish || mongoose.model("wish", wishSchema);
