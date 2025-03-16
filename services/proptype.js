var proptypeModel = require("../models/proptype");

module.exports = {
    insert,
    update
};

async function insert(body) {
    try {
        const { name } = body

        if (!name) return { status: 400, message: "Tên proptype không được trống !" }

        const proptypeNew = new proptypeModel({
            name: name,
        })

        await proptypeNew.save()

        return { status: 200, message: "Success" }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function update(id, body) {
    try {
        const proptype = await proptypeModel.findById(id)
        if (!proptype) return { status: 400, message: "Danh mục không tồn tại !" }

        const { name } = body

        await proptypeModel.findByIdAndUpdate(id, {
            $set: {
                name: name,
            }
        }, { new: true })

        return { status: 200, message: "Success" }
    } catch (error) {
        console.log(error);
        throw error;
    }
}