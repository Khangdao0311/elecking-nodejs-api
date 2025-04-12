var orderModel = require("../models/order");
var userModel = require("../models/user");
var payment_methodModel = require("../models/payment_method");
var voucherModel = require("../models/voucher");
var productModel = require("../models/product");
var propertyModel = require("../models/property");
var addressModel = require("../models/address");
const moment = require("moment");

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
        const { status, user_id, payment_status, day, month, year, orderby, page = 1, limit = '' } = query;

        let sortCondition = {};

        if (orderby) {
            const [sort, so] = orderby.split("-");
            sortCondition[sort == "id" ? "_id" : sort] = so ? so == "desc" ? -1 : 1 : -1;
        } else {
            sortCondition._id = -1;
        }

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

        const pipeline = [
            { $match: matchCondition },
            { $sort: sortCondition },
        ];

        if (+limit && !isNaN(+limit)) {
            const skip = (page - 1) * limit;
            pipeline.push({ $skip: skip });
            pipeline.push({ $limit: +limit });
        }

        const pipelineStatusCount = [];
        const pipelinePaymentStatusCount = [];

        let matchConditionQueryTotal = {};
        let matchConditionStatus = {}
        let matchConditionPaymentStatus = {}
        let matchConditionOrderTotal = {};

        if (user_id) {
            matchConditionStatus.push({ user_id: new ObjectId(user_id) });
            matchConditionPaymentStatus.push({ user_id: new ObjectId(user_id) });
            matchConditionOrderTotal.user_id = new ObjectId(user_id);
        }

        if (year) {
            const paddedMonth = month?.padStart(2, '0') || '01';
            const paddedDay = day?.padStart(2, '0') || '01';

            let startMoment, endMoment;

            if (year && month && day) {
                startMoment = moment(`${year}-${paddedMonth}-${paddedDay} 00:00:00`, 'YYYY-MM-DD HH:mm:ss');
                endMoment = moment(`${year}-${paddedMonth}-${paddedDay} 23:59:59`, 'YYYY-MM-DD HH:mm:ss');
            } else if (year && month) {
                startMoment = moment(`${year}-${paddedMonth}-01 00:00:00`, 'YYYY-MM-DD HH:mm:ss');
                endMoment = moment(startMoment).endOf('month').set({ hour: 23, minute: 59, second: 59 });
            } else {
                startMoment = moment(`${year}-01-01 00:00:00`, 'YYYY-MM-DD HH:mm:ss');
                endMoment = moment(`${year}-12-31 23:59:59`, 'YYYY-MM-DD HH:mm:ss');
            }

            const start = startMoment.format('YYYYMMDDHHmmss')
            const end = endMoment.format('YYYYMMDDHHmmss')

            matchCondition.ordered_at = { $gte: start, $lte: end };
            matchConditionQueryTotal.ordered_at = { $gte: start, $lte: end };
            matchConditionStatus.ordered_at = { $gte: start, $lte: end };
            matchConditionPaymentStatus.ordered_at = { $gte: start, $lte: end };
            matchConditionOrderTotal.ordered_at = { $gte: start, $lte: end };
        }

        pipelineStatusCount.push({ $match: matchConditionStatus },)
        pipelineStatusCount.push({ $group: { _id: "$status", count: { $sum: 1 } } });
        pipelinePaymentStatusCount.push({ $match: matchConditionPaymentStatus },)
        pipelinePaymentStatusCount.push({ $match: { payment_status: true } });

        const orders = await orderModel.aggregate(pipeline);
        const queryTotal = await orderModel.aggregate([{ $match: matchConditionQueryTotal }]);
        const statusCounts = await orderModel.aggregate(pipelineStatusCount);
        const paymentStatusCounts = await orderModel.aggregate(pipelinePaymentStatusCount);
        const orderTotal = await orderModel.aggregate([{ $match: matchConditionOrderTotal }]);

        // Chuyển danh sách statusCounts thành object để dễ truy xuất
        const totalByStatus = { '0': 0, '1': 0, '2': 0, '3': 0, '4': 0, payment_status: paymentStatusCounts.length };
        statusCounts.forEach(item => {
            totalByStatus[item._id] = item.count;
        });

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
            total: queryTotal.length,
            totalOrder: {
                "all": orderTotal.length,
                ...totalByStatus
            },
        };

    } catch (error) {
        console.log(error);
        throw error;
    }
}