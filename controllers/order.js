var orderModel = require("../models/order");
var userModel = require("../models/user");
var payment_methodModel = require("../models/payment_method");
var voucherModel = require("../models/voucher");

const { ObjectId } = require("mongodb");

module.exports = {
    getById,
    getQuery
};

async function getById(id) {
    try {
        const order = await orderModel.findById(id);
        if (!order) return { status: 400, message: "Đơn hàng không tồn tại !" }

        const user = await userModel.findById(order.user_id)
        const payment_method = await payment_methodModel.findById(order.payment_method_id)
        let voucher = null
        if (!order.voucher_id) voucher = await voucherModel.findById(order.voucher_id)


        const data = {
            id: order._id,
            total: order.total,
            status: order.status,
            payment_status: order.payment_status,
            ordered_at: order.ordered_at,
            updated_at: order.updated_at,
            transaction_code: order.transaction_code,
            price_ship: order.price_ship,
            products: order.products,
            user: {
                id: user._id,
                fullname: user.fullname,
            },
            voucher: voucher ? {
                id: voucher._id,
                code: voucher.code
            } : null,
            payment_method: {
                id: payment_method._id,
                name: payment_method.name
            },
            address_id: order.address_id,
        };

        return { status: 200, message: "Thành công !", data: data }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function getQuery(query) {
    try {
        const { status, orderby, page = 1, limit = 5 } = query;

        let matchCondition = {};

        if (status) {
            if (![0, 1, 2, 3].includes(+status)) return { status: 400, message: "Trạng thái không tồn tại !" }
            matchCondition.status = +status
        }

        let sortCondition = {};

        if (orderby) {
            const [sort, so] = orderby.split("-");
            sortCondition[sort == "id" ? "_id" : sort] = so ? so == "desc" ? -1 : 1 : -1;
        } else {
            sortCondition.id = -1;
        }

        const skip = (page - 1) * limit;

        const pipeline = [
            { $match: matchCondition },
            { $sort: sortCondition },
            { $skip: skip },
            { $limit: +limit },
        ];

        const pipelineTotal = [
            { $match: matchCondition },
        ];

        const orders = await orderModel.aggregate(pipeline);
        const ordersTotal = await orderModel.aggregate(pipelineTotal);

        const data = []

        for (const order of orders) {

            const user = await userModel.findById(order.user_id)
            const payment_method = await payment_methodModel.findById(order.payment_method_id)
            let voucher = null
            if (!order.voucher_id) voucher = await voucherModel.findById(order.voucher_id)

            data.push({
                id: order._id,
                total: order.total,
                status: order.status,
                payment_status: order.payment_status,
                ordered_at: order.ordered_at,
                updated_at: order.updated_at,
                transaction_code: order.transaction_code,
                price_ship: order.price_ship,
                products: order.products,
                user: {
                    id: user._id,
                    fullname: user.fullname,
                },
                voucher: voucher ? {
                    id: voucher._id,
                    code: voucher.code
                } : null,
                payment_method: {
                    id: payment_method._id,
                    name: payment_method.name
                },
                address_id: order.address_id,
            })
        }


        // const data = orders.map((order) => ({
        //     id: order._id,
        //     total: order.total,
        //     status: order.status,
        //     payment_status: order.payment_status,
        //     ordered_at: order.ordered_at,
        //     updated_at: order.updated_at,
        //     transaction_code: order.transaction_code,
        //     price_ship: order.price_ship,
        //     products: order.products,
        //     user_id: order.user_id,
        //     voucher_id: order.voucher_id,
        //     payment_method_id: order.payment_method_id,
        //     address_id: order.address_id,
        // }));

        return { status: 200, message: "Thành công !", data: data, total: ordersTotal.length }
    } catch (error) {
        console.log(error);
        throw error;
    }
}