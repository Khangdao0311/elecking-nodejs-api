const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const addressSchema = new Schema({
    province : { type: Number },
    district  : { type: Number },
    ward : { type: Number },
    description : { type: Number },
    phone : { type: Number },
    phone : { type: Number },
    fullname : { type: Number },
    type : { type: Number },
    default : { type: Number },
    user_id: { type: ObjectId, ref: "user" },
});

module.exports =
    mongoose.models.address || mongoose.model("address", addressSchema);
