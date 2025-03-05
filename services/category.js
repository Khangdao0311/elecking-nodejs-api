var categoryModel = require("../models/category");

module.exports = {
    insert,
    update
};

async function insert(body) {
    try {
        const { name, image = "", description = "", properties = "[]" } = body

        if (!name) return { status: 400, message: "Tên danh mục không được trống !" }

        if (!(typeof properties === 'string' && (() => { try { return Array.isArray(JSON.parse(properties)); } catch { return false; } })())) return { status: 400, message: "Property không đúng dữ liệu !" }

        const categoryNew = new categoryModel({
            name: name,
            image: image,
            status: 1,
            properties: JSON.parse(properties),
            description: description,
        })

        await categoryNew.save()

        return { status: 200, message: "Thành công !" }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function update(id, body) {
    try {
        const category = await categoryModel.findById(id)
        if (!category) return { status: 400, message: "Danh mục không tồn tại !" }

        const { name, image, status, description, properties } = body

        if (![0, 1, 2].includes(+status)) return { status: 400, message: "Trạng thái danh mục không hợp lệ !" }

        if (!(typeof properties === 'string' && (() => { try { return Array.isArray(JSON.parse(properties)); } catch { return false; } })())) return { status: 400, message: "Property không đúng dữ liệu !" }

        await categoryModel.findByIdAndUpdate(id, {
            $set: {
                name: name,
                image: image,
                status: +status,
                properties: JSON.parse(properties),
                description: description
            }
        }, { new: true })

        return { status: 200, message: "Thành công !" }
    } catch (error) {
        console.log(error);
        throw error;
    }
}