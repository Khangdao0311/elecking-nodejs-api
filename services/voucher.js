const voucherModel = require("../models/voucher");
const userModel = require("../models/user");
const { ObjectId } = require("mongodb");

module.exports = {
    insert,
    update
};

async function insert(body) {
    try {
        const { code, discount_type, discount_value, min_order_value, max_discount, start_date, end_date, quantity, user_id = null } = body

        if (user_id) {
            const user = await userModel.findById(user_id)
            if (!user) return { status: 400, message: "Nghười dung không tồn tại !" }
        }

        const voucher = await voucherModel.findOne({
            code: {
                $regex: `^${code}$`,  // ^ và $ đảm bảo khớp toàn bộ
                $options: "i"
            }
        })
        if (voucher) return { status: 400, message: "Voucher đã tồn tại !" }

        if (!discount_type || ![1, 2].includes(+discount_type)) return { status: 400, message: "Loại voucher không tồn tại !" }

        if (discount_type == 2 && (+discount_value == 0 || +discount_value > 100)) return { status: 400, message: "discount_value không được quá 100%" }

        const voucherNew = new voucherModel({
            code: code,
            discount_type: +discount_type,
            discount_value: +discount_value,
            min_order_value: +min_order_value,
            max_discount: +discount_type == 1 ? +discount_value : +max_discount,
            start_date: start_date,
            end_date: end_date,
            quantity: +quantity,
            user_id: user_id ? new ObjectId(user_id) : null
        })

        await voucherNew.save()

        return { status: 200, message: "Success" }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function update(id, body) {
    try {
        const voucher = await voucherModel.findById(id)
        if (!voucher) return { status: 400, message: "Voucher không tồn tại !" }

        const { discount_type, discount_value, min_order_value, max_discount, start_date, end_date, quantity, user_id = null } = body

        if (user_id) {
            const user = await userModel.findById(user_id)
            if (!user) return { status: 400, message: "Nghười dung không tồn tại !" }
        }

        if (!discount_type || ![1, 2].includes(+discount_type)) return { status: 400, message: "Loại voucher không tồn tại !" }

        if (discount_type == 1 && (+discount_value < 1000)) return { status: 400, message: "discount_value không được dưới 1.000 đ !" }
        if (discount_type == 2 && (+discount_value == 0 || +discount_value > 100)) return { status: 400, message: "discount_value không được quá 100% !" }
        if (discount_type == 2 && !max_discount) return { status: 400, message: "max_discount không được trống !" }

        await voucherModel.findByIdAndUpdate(id, {
            $set: {
                discount_type: +discount_type,
                discount_value: +discount_value,
                min_order_value: +min_order_value,
                max_discount: +discount_type == 1 ? +discount_value : +max_discount,
                start_date: start_date,
                end_date: end_date,
                 quantity: +quantity,
                user_id: user_id ? new ObjectId(user_id) : null
            }
        }, { new: true })

        return { status: 200, message: "Success" }
    } catch (error) {
        console.log(error);
        throw error;
    }
}