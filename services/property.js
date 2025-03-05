var propertyModel = require("../models/property");

module.exports = {
    insert,
    update
};

async function insert(body) {
    try {
        const { name, type } = body

        if (!name) return { status: 400, message: "Không có trường Name (Tên property)" }
        if (!type) return { status: 400, message: "Không có trường type (Loại property)" }

        const propertyNew = new propertyModel({
            name: name,
            type: type
        })

        await propertyNew.save()

        return { status: 200, message: "Thành công !" }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function update(id, body) {
    try {
        const property = await propertyModel.findById(id)
        if (!property) return { status: 400, message: "Property không tồn tại !" }

        const { name, type } = body

        await propertyModel.findByIdAndUpdate(id, {
            $set: {
                name: name,
                type: type,
            }
        }, { new: true })

        return { status: 200, message: "Thành công !" }
    } catch (error) {
        console.log(error);
        throw error;
    }
}