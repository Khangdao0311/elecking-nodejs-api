const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const addressSchema = new Schema({
    province: { code: { type: Number }, name: { type: String } },
    district: { code: { type: Number }, name: { type: String } },
    ward: { code: { type: Number }, name: { type: String } },
    description: { type: String },
    phone: { type: String },
    fullname: { type: String },
    type: { type: Number },
    status: { type: Number },
    setDefault: { type: Boolean },
    user_id: { type: ObjectId, ref: "user" },
}, { versionKey: false });

module.exports =
    mongoose.models.address || mongoose.model("address", addressSchema);
