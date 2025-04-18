const { ObjectId } = require("mongodb");

var orderModel = require("../models/order");
var userModel = require("../models/user");
var payment_methodModel = require("../models/payment_method");
var voucherModel = require("../models/voucher");
var productModel = require("../models/product");
var propertyModel = require("../models/property");
var addressModel = require("../models/address");

module.exports = {
    getOrder,
    getOrdersQuery,
    getProfile
};

async function getOrder(id) {
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

async function getOrdersQuery(query) {
    try {
        const { user_id, status, orderby, page = 1, limit = '' } = query;

        let sortCondition = {};
        let matchCondition = {};

        if (orderby) {
            const [sort, so] = orderby.split("-");
            sortCondition[sort == "id" ? "_id" : sort] = so ? so == "desc" ? -1 : 1 : -1;
        } else {
            sortCondition._id = -1;
        }

        if (status) {
            if (![0, 1, 2, 3, 4].includes(+status)) return { status: 400, message: "Trạng thái không tồn tại !" }
            matchCondition.status = +status;
        }

        if (user_id) {
            matchCondition.user_id = new ObjectId(user_id);
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

        let matchConditionQueryTotal = {};
        let matchConditionStatus = {}
        let matchConditionOrderTotal = {};

        matchConditionQueryTotal.user_id = new ObjectId(user_id)
        matchConditionStatus.user_id = new ObjectId(user_id)
        matchConditionOrderTotal.user_id = new ObjectId(user_id);

        pipelineStatusCount.push({ $match: matchConditionStatus },)
        pipelineStatusCount.push({ $group: { _id: "$status", count: { $sum: 1 } } });

        const orders = await orderModel.aggregate(pipeline);
        const queryTotal = await orderModel.aggregate([{ $match: matchConditionQueryTotal }]);
        const statusCounts = await orderModel.aggregate(pipelineStatusCount);
        const orderTotal = await orderModel.aggregate([{ $match: matchConditionOrderTotal }]);

        // Chuyển danh sách statusCounts thành object để dễ truy xuất
        const totalByStatus = { '0': 0, '1': 0, '2': 0, '3': 0, '4': 0 };
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

async function getProfile(id) {
    try {
        const user = await userModel.findById(id);
        if (!user) return { status: 400, message: "Người dùng không tồn tại !" }

        const data = {
            id: user._id,
            fullname: user.fullname,
            avatar: user.avatar ? `${process.env.URL_IMAGE}${user.avatar}` : "",
            email: user.email,
            phone: user.phone,
            username: user.username,
            role: user.role,
            status: user.status,
            register_date: user.register_date,
            cart: user.cart,
            wish: user.wish,
        }

        return { status: 200, message: "Success", data: data }
    } catch (error) {
        console.log(error);
        throw error;
    }
}