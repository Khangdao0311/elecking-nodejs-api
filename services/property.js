var propertyModel = require("../models/property");
var proptypeModel = require("../models/proptype");

module.exports = {
    insert,
    update
};

async function insert(body) {
    try {
        const { name, proptype_id } = body

        if (!name) return { status: 400, message: "Không có trường Name (Tên property)" }

        const proptype = await proptypeModel.findById(proptype_id)
        if (!proptype) return { status: 400, message: "propType không tồn tại !" }

        const propertyNew = new propertyModel({
            name: name,
            proptype_id: proptype._id
        })

        await propertyNew.save()

        return { status: 200, message: "Success" }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function update(id, body) {
    try {
        const property = await propertyModel.findById(id)
        if (!property) return { status: 400, message: "Property không tồn tại !" }

        const { name, proptype_id } = body

        const proptype = await proptypeModel.findById(proptype_id)
        if (!proptype) return { status: 400, message: "propType không tồn tại !" }

        await propertyModel.findByIdAndUpdate(id, {
            $set: {
                name: name,
                proptype_id: proptype._id,
            }
        }, { new: true })

        return { status: 200, message: "Success" }
    } catch (error) {
        console.log(error);
        throw error;
    }
}