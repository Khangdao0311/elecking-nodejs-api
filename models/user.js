const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

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
  cart: [
    {
      quantity: { type: String },
      product: {
        product_id: { type: ObjectId, ref: "product" },
        variant: { type: Number },
        color: { type: Number },
      },
      
    }
  ],
  wish: [
    {
      product: {
        product_id: { type: ObjectId, ref: "product" },
        variant: { type: Number },
        color: { type: Number },
      },
    }
  ]

});

module.exports =
  mongoose.models.user || mongoose.model("user", userSchema);
