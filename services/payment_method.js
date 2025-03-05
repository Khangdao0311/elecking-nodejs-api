const payment_methodModel = require("../models/payment_method");

module.exports = {
    insert,
    update
};

async function insert(body) {
    try {
        const { name, description } = body

        const payment_method = await payment_methodModel.findOne({
            name: {
                $regex: `^${name}$`,  // ^ và $ đảm bảo khớp toàn bộ
                $options: "i"
            }
        })

        if (payment_method) return { status: 400, message: "Phương thức thanh toán đã tồn tại !" }


        const payment_methodNew = new payment_methodModel({
            name: name,
            description: description,
        })

        await payment_methodNew.save()

        return { status: 200, message: "Thành công !" }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function update(id, body) {
    try {
        const payment_method = await payment_methodModel.findById(id)
        if (!payment_method) return { status: 400, message: "Địa chỉ không tồn tại !" }

        const { name, description } = body

        await payment_methodModel.findByIdAndUpdate(id, {
            $set: {
                name: name,
                description: description,
            }
        }, { new: true })

        return { status: 200, message: "Thành công !" }
    } catch (error) {
        console.log(error);
        throw error;
    }
}