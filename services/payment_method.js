var fs = require("fs");

const payment_methodModel = require("../models/payment_method");

module.exports = {
    insert,
    update
};

async function insert(body) {
    try {
        const { name, image = '', description = '' } = body

        const payment_method = await payment_methodModel.findOne({
            name: {
                $regex: `^${name}$`,  // ^ và $ đảm bảo khớp toàn bộ
                $options: "i"
            }
        })

        if (!name) return { status: 400, message: "Trường name không tồn tại !" }

        if (payment_method) return { status: 400, message: "Phương thức thanh toán đã tồn tại !" }

        const payment_methodNew = new payment_methodModel({
            name: name,
            image: image,
            description: description,
        })

        await payment_methodNew.save()

        return { status: 200, message: "Success" }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function update(id, body) {
    try {
        const payment_method = await payment_methodModel.findById(id)
        if (!payment_method) return { status: 400, message: "Địa chỉ không tồn tại !" }

        const { name, image, description } = body

        if (payment_method.image !== "" && payment_method.image !== image) {
            fs.unlink(`./public/images/${payment_method.image}`, function (err) {
                if (err) return console.log(err);
                console.log("file deleted successfully");
            });
        }

        await payment_methodModel.findByIdAndUpdate(id, {
            $set: {
                name: name,
                image: image,
                description: description,
            }
        }, { new: true })

        return { status: 200, message: "Success" }
    } catch (error) {
        console.log(error);
        throw error;
    }
}