var orderModel = require("../models/order");
var userModel = require("../models/user");
var voucherModel = require("../models/voucher");
var payment_methodModel = require("../models/payment_method");
var addressModel = require("../models/address");

const { ObjectId } = require("mongodb");
const moment = require("moment");

module.exports = {
    create,
    updateTransactionCode,
    updateStatus,
    updateStatusReview
};

async function create(body) {
    try {
        const { total, price_ship, products, user_id, voucher_id, payment_method_id, address_id } = body

        const user = await userModel.findById(user_id)
        if (!user) return { status: 400, message: "Người dùng không tồn tại !" }

        const payment_method = await payment_methodModel.findById(payment_method_id)
        if (!payment_method) return { status: 400, message: "Phương thức thanh toán không tồn tại !" }

        const address = await addressModel.findById(address_id)
        if (!address) return { status: 400, message: "Địa chỉ không tồn tại !" }

        if (voucher_id) {
            const voucher = await voucherModel.findById(voucher_id)
            if (!voucher) return { status: 400, message: "Voucher không tồn tại !" }
        }

        const date = new Date();
        const ordered_at = moment(date).format('YYYYMMDDHHmmss');

        const orderNew = new orderModel({
            total: +total,
            status: 1,
            payment_status: false,
            ordered_at: ordered_at,
            updated_at: ordered_at,
            transaction_code: "",
            price_ship: +price_ship,
            products: JSON.parse(products).map(product => ({
                ...product,
                product_id: new ObjectId(product.product_id),
                status: false
            })),
            user_id: new ObjectId(user_id),
            voucher_id: voucher_id ? new ObjectId(voucher_id) : null,
            payment_method_id: payment_method_id,
            address_id: new ObjectId(address_id)
        });

        await orderNew.save();

        return { status: 200, message: "Thành công !" }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function updateTransactionCode(id, body) {
    try {
        const { transaction_code } = body
        const order = await orderModel.findById(id)
        if (!order) return { status: 400, message: "Đơn hàng không tồn tại !" }

        const date = new Date();
        const updated_at = moment(date).format('YYYYMMDDHHmmss');

        await orderModel.findByIdAndUpdate(id,
            {
                $set: {
                    transaction_code: transaction_code,
                    payment_status: true,
                    updated_at: updated_at
                }
            },
            { new: true, runValidators: true })

        return { status: 200, message: "Thành công !" }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function updateStatus(id, body) {
    try {
        const { status } = body

        if (![0, 1, 2, 3].includes(+status)) return { status: 400, message: "Trạng thái không hợp lệ !" }

        const order = await orderModel.findById(id)
        if (!order) return { status: 400, message: "Đơn hàng không tồn tại !" }

        const date = new Date();
        const updated_at = moment(date).format('YYYYMMDDHHmmss');

        await orderModel.findByIdAndUpdate(id,
            {
                $set: {
                    status: status,
                    updated_at: updated_at
                }
            },
            { new: true, runValidators: true })

        return { status: 200, message: "Thành công !" }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function updateStatusReview(id, body) {
    try {
        const { product_id } = body

        const order = await orderModel.findById(id)
        if (!order) return { status: 400, message: "Đơn hàng không tồn tại !" }

        const products = order.products.map(product => ({
            product_id: product.product_id,
            variant: product.variant,
            color: product.color,
            quantity: product.quantity,
            price: product.price,
            status: product.product_id.equals(new ObjectId(product_id)) || product.status
        }))

        await orderModel.findByIdAndUpdate(id, { $set: { products: products } }, { new: true, runValidators: true })

        return { status: 200, message: "Thành công !" }
    } catch (error) {
        console.log(error);
        throw error;
    }
}