const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const cartItemSchema = new Schema({
  quantity: { type: Number },
  product: {
    id: { type: ObjectId, ref: "product" },
    variant: { type: Number },
    color: { type: Number },
  },
}, { _id: false, versionKey: false });

const userSchema = new Schema({
  fullname: { type: String },
  avatar: { type: String },
  email: { type: String },
  phone: { type: String },
  username: { type: String },
  password: { type: String },
  role: { type: Number },
  status: { type: Number },
  register_date: { type: String },
  cart: [cartItemSchema],
  wish: [
    { type: ObjectId, ref: "product" }
  ],
}, { versionKey: false });

module.exports =
  mongoose.models.user || mongoose.model("user", userSchema);
