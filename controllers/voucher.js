var voucherModel = require("../models/voucher");
var userModel = require("../models/user");
var orderModel = require("../models/order");
const moment = require("moment");

const { ObjectId } = require("mongodb");

module.exports = {
    getById,
    getQuery
};

async function getById(id) {
    try {
        const voucher = await voucherModel.findById(id);
        if (!voucher) return { status: 400, message: "Voucher không tồn tại !" }

        const data = {
            id: voucher._id,
            code: voucher.code,
            discount_type: voucher.discount_type,
            discount_value: voucher.discount_value,
            min_order_value: voucher.min_order_value,
            max_discount: voucher.max_discount,
            start_date: voucher.start_date,
            end_date: voucher.end_date,
            quantity: voucher.quantity,
            user_id: voucher.user_id,
        };

        return { status: 200, message: "Success", data: data }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function getQuery(query) {
    try {
        const { id, search, expired = "0", user_id, orderby, page = 1, limit = '' } = query;

        let matchCondition = {};

        if (search) {
            matchCondition.code = {
                $regex: search,
                $options: "i",
            };
        }

        if (id) {
            matchCondition._id = {
                $in: id.split("-").map((_id) => new ObjectId(_id)),
            };
        }


        matchCondition.$and = [
            {
                [expired === '1' ? "$or" : "$and"]: [
                    {
                        end_date: {
                            [expired === '1' ? "$lt" : "$gte"]: moment().format("YYYYMMDD")
                        }
                    },
                    {
                        quantity: {
                            [expired === '1' ? "$eq" : "$gt"]: 0
                        }
                    }
                ]
            }
        ];

        if (user_id) {
            const user = await userModel.findById(user_id)
            if (!user) return { status: 400, mesage: "Người dùng không tồn tại !" }
            matchCondition.$and.push({
                $or: [
                    { user_id: user._id },
                    { user_id: null }
                ]
            });
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

        const pipelineTotal = [
            { $match: matchCondition },
        ];

        const vouchers = await voucherModel.aggregate(pipeline);
        const vouchersTotal = await voucherModel.aggregate(pipelineTotal);

        const data = []

        for (const voucher of vouchers) {
            data.push({
                id: voucher._id,
                code: voucher.code,
                discount_type: voucher.discount_type,
                discount_value: voucher.discount_value,
                min_order_value: voucher.min_order_value,
                max_discount: voucher.max_discount,
                start_date: voucher.start_date,
                end_date: voucher.end_date,
                quantity: voucher.quantity,
                used: await orderModel.countDocuments({ voucher_id: voucher._id }),
                user_id: voucher.user_id,
            })
        }

        return { status: 200, message: "Success", data: data, total: vouchersTotal.length }
    } catch (error) {
        console.log(error);
        throw error;
    }
}