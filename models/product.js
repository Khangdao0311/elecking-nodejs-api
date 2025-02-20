const mongoose = require("mongoose");
const properties = require("./property");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const productSchema = new Schema({
  name: { type: String },
  images: [
    { type: String }
  ],
  price: { type: Number },
  variants: [
    {
      property_ids: [
        {
          type: Schema.Types.ObjectId,
          ref: "property"
        }
      ],
      price_extra: { type: Number },
      price_sale: { type: Number },
      colors: [
        {
          name: { type: String },
          image: { type: String },
          price_extra: { type: String },
          status: { type: Number },
          quantity: { type: Number },
        },
      ],
    },
  ],
  sale: { type: Boolean },
  status: { type: Number },
  view: { type: Number },
  description: { type: String },
  brand_id: { type: ObjectId, ref: "brand" },
  category_id: { type: ObjectId, ref: "category" },
});

module.exports =
  mongoose.models.product || mongoose.model("product", productSchema);
