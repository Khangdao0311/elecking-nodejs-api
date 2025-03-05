const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const colorSchema = new Schema({
  name: { type: String },
  image: { type: String },
  price_extra: { type: Number },
  status: { type: Number },
  quantity: { type: Number },
}, { _id: false, versionKey: false });

const variantSchema = new Schema({
  property_ids: [
    { type: ObjectId, ref: "property" }
  ],
  price: { type: Number },
  price_sale: { type: Number },
  colors: [colorSchema],
}, { _id: false, versionKey: false });

const productSchema = new Schema({
  name: { type: String },
  images: [
    { type: String }
  ],
  variants: [variantSchema],
  view: { type: Number },
  description: { type: String },
  brand_id: { type: ObjectId, ref: "brand" },
  category_id: { type: ObjectId, ref: "category" },
}, { versionKey: false });

module.exports =
  mongoose.models.product || mongoose.model("product", productSchema);
