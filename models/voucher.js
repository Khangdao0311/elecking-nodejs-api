const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const voucherSchema = new Schema({
  code: { type: String },
  discount_type: { type: Number },
  discount_value: { type: Number },
  min_order_value: { type: Number },
  max_discount: { type: Number },
  start_date: { type: String },
  end_date: { type: String },
  quantity: { type: Number },
  user_id: { type: ObjectId, ref: "user" },

}, { versionKey: false });

module.exports =
  mongoose.models.voucher || mongoose.model("voucher", voucherSchema);
