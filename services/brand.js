var brandModel = require("../models/brand");

module.exports = {
    insert,
    update
};

async function insert(body) {
    try {
        const { name, logo = "", banner = "", description = "" } = body

        if (!name) return { status: 400, message: "Không có trường Name (Tên thương hiệu)" }

        const brandNew = new brandModel({
            name: name,
            logo: logo,
            banner: banner,
            status: 1,
            description: description
        })

        await brandNew.save()

        return { status: 200, message: "Thành công !" }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function update(id, body) {
    try {
        const brand = await brandModel.findById(id)
        if (!brand) return { status: 400, message: "Thương hiệu không tồn tại !" }

        const { name, logo, banner, status, description } = body

        if (![0, 1, 2].includes(+status)) return { status: 400, message: "Trạng thái thương hiệu không hợp lệ !" }

        await brandModel.findByIdAndUpdate(id, {
            $set: {
                name: name,
                logo: logo,
                banner: banner,
                status: +status,
                description: description
            }
        }, { new: true })

        return { status: 200, message: "Thành công !" }
    } catch (error) {
        console.log(error);
        throw error;
    }
}