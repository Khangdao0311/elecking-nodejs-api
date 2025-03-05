var orderModel = require("../models/order");

const { ObjectId } = require("mongodb");

module.exports = {
    getById,
    getQuery,
    getTotalPagesByQuery
};

async function getById(id) {
    try {
        const order = await orderModel.findById(id);
        if (!order) return { status: 400, message: "Đơn hàng không tồn tại !" }

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
            user_id: order.user_id,
            voucher_id: order.voucher_id,
            payment_method_id: order.payment_method_id,
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

        const orders = await orderModel.aggregate(pipeline);

        const data = orders.map((order) => ({
            id: order._id,
            total: order.total,
            status: order.status,
            payment_status: order.payment_status,
            ordered_at: order.ordered_at,
            updated_at: order.updated_at,
            transaction_code: order.transaction_code,
            price_ship: order.price_ship,
            products: order.products,
            user_id: order.user_id,
            voucher_id: order.voucher_id,
            payment_method_id: order.payment_method_id,
            address_id: order.address_id,
        }));

        return { status: 200, message: "Thành công !", data: data }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function getTotalPagesByQuery(query) {
    try {
        const { status, limit = 5 } = query;

        let matchCondition = {};

        if (status) {
            if (![0, 1, 2, 3].includes(+status)) return { status: 400, message: "Trạng thái không tồn tại !" }
            matchCondition.status = +status
        }

        const pipeline = [
            { $match: matchCondition },
        ];

        const orders = await orderModel.aggregate(pipeline);

        const data = Math.ceil(orders.length / limit);

        return { status: 200, message: "Thành công !", data: data }
    } catch (error) {
        console.log(error);
        throw error;
    }
}