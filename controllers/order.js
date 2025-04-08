var orderModel = require("../models/order");
var userModel = require("../models/user");
var payment_methodModel = require("../models/payment_method");
var voucherModel = require("../models/voucher");
var productModel = require("../models/product");
var propertyModel = require("../models/property");
var addressModel = require("../models/address");

const { ObjectId } = require("mongodb");
const order = require("../models/order");

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
        const address = await addressModel.findById(order.address_id)

        const productsOrder = []

        for (const item of order.products) {

            const product = await productModel.findById(item.product.id)


            const name = [product.name];

            for (const property_id of product.variants[item.product.variant].property_ids) {
                const property = await propertyModel.findById(property_id);
                name.push(property?.name);
            }
            name.push(product.variants[item.product.variant].colors[item.product.color].name)

            productsOrder.push({
                ...item.toObject(),
                product: {
                    ...item.product,
                    id: product.id,
                    name: name.join(" - "),
                    image: product.variants[item.product.variant].colors[item.product.color].image
                        ? `${process.env.URL_IMAGE}${product.variants[item.product.variant].colors[item.product.color].image}`
                        : "",
                    price: item.product.price
                },

            })

        }

        const data = {
            id: order._id,
            total: order.total,
            status: order.status,
            payment_status: order.payment_status,
            ordered_at: order.ordered_at,
            updated_at: order.updated_at,
            transaction_code: order.transaction_code,
            price_ship: order.price_ship,
            note: order.note,
            products: productsOrder,
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
            address: {
                id: address._id,
                province: address.province,
                district: address.district,
                ward: address.ward,
                description: address.description,
                phone: address.phone,
                fullname: address.fullname,
                type: address.type,
                status: address.status,
                setDefault: address.setDefault,
                user_id: address.user_id,
            },
        };

        return { status: 200, message: "Success", data: data }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function getQuery(query) {
    try {
        const { status, user_id, payment_status, orderby, page = 1, limit = '' } = query;

        let matchCondition = {};

        if (status) {
            if (![0, 1, 2, 3, 4].includes(+status)) return { status: 400, message: "Trạng thái không tồn tại !" }
            matchCondition.status = +status;
        }

        if (user_id) {
            matchCondition.user_id = new ObjectId(user_id);
        }

        if (payment_status) {
            matchCondition.payment_status = JSON.parse(payment_status);
        }

        let sortCondition = {};

        if (orderby) {
            const [sort, so] = orderby.split("-");
            sortCondition[sort == "id" ? "_id" : sort] = so ? so == "desc" ? -1 : 1 : -1;
        } else {
            sortCondition._id = -1;
        }

        const pipeline = [
            { $match: matchCondition },
            { $sort: sortCondition },
        ];

        if (+limit && !isNaN(+limit)) {
            const skip = (page - 1) * limit;
            pipeline.push({ $skip: skip });
            pipeline.push({ $limit: +limit });
        }
        
        // Pipeline đếm tổng số đơn hàng theo từng status
        const pipelineStatusCount = [];
        if (user_id) pipelineStatusCount.push({ $match: { user_id: new ObjectId(user_id) } });
        pipelineStatusCount.push({ $group: { _id: "$status", count: { $sum: 1 } } });

        const pipelinePaymentStatusCount = [];
        if (user_id) pipelinePaymentStatusCount.push({ $match: { user_id: new ObjectId(user_id) } });
        pipelinePaymentStatusCount.push({ $match: { payment_status: true } });
        
        const matchConditionTotal = {};
        if (user_id) matchConditionTotal.user_id = new ObjectId(user_id);

        const orders = await orderModel.aggregate(pipeline);
        const ordersTotal = await orderModel.aggregate([{ $match: matchCondition }]);

        const statusCounts = await orderModel.aggregate(pipelineStatusCount);
        const paymentStatusCounts = await orderModel.aggregate(pipelinePaymentStatusCount);
        const totalCounts = await orderModel.aggregate([{ $match: matchConditionTotal }]);

        // Chuyển danh sách statusCounts thành object để dễ truy xuất
        const totalByStatus = { '0': 0, '1': 0, '2': 0, '3': 0, '4': 0 };
        statusCounts.forEach(item => {
            totalByStatus[item._id] = item.count;
        });
        totalByStatus['payment_status'] = paymentStatusCounts.length;

        const data = [];

        for (const order of orders) {
            const user = await userModel.findById(order.user_id);
            const payment_method = await payment_methodModel.findById(order.payment_method_id);
            let voucher = null;
            if (order.voucher_id) voucher = await voucherModel.findById(order.voucher_id);
            const address = await addressModel.findById(order.address_id);

            const productsOrder = [];

            for (const item of order.products) {
                const product = await productModel.findById(item.product.id);
                const name = [product.name];

                for (const property_id of product.variants[item.product.variant].property_ids) {
                    const property = await propertyModel.findById(property_id);
                    name.push(property?.name);
                }
                name.push(product.variants[item.product.variant].colors[item.product.color].name);

                productsOrder.push({
                    ...item,
                    product: {
                        ...item.product,
                        id: product.id,
                        name: name.join(" - "),
                        image: product.variants[item.product.variant].colors[item.product.color].image
                            ? `${process.env.URL_IMAGE}${product.variants[item.product.variant].colors[item.product.color].image}`
                            : "",
                        price: item.product.price
                    },
                });
            }

            data.push({
                id: order._id,
                total: order.total,
                status: order.status,
                payment_status: order.payment_status,
                ordered_at: order.ordered_at,
                updated_at: order.updated_at,
                transaction_code: order.transaction_code,
                price_ship: order.price_ship,
                note: order.note,
                products: productsOrder,
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
                address: {
                    id: address._id,
                    province: address.province,
                    district: address.district,
                    ward: address.ward,
                    description: address.description,
                    phone: address.phone,
                    fullname: address.fullname,
                    type: address.type,
                    status: address.status,
                },
            });
        }

        return {
            status: 200,
            message: "Success",
            data: data,
            total: ordersTotal.length,
            totalOrder: {
                "all": totalCounts.length,
                ...totalByStatus
            },
        };

    } catch (error) {
        console.log(error);
        throw error;
    }
}