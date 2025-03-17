var voucherModel = require("../models/voucher");
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
            status: voucher.status,
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
        const { id, search, expired, orderby, page = 1, limit = 5 } = query;

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


        if (expired) {
            matchCondition.$or = [
                {
                    end_date: {
                        [expired !== '1' ? "$lt" : "$gte"]: moment().format("YYYYMMDD")
                    }
                },
                {
                    quantity: {
                        [expired !== '1' ? "$lte" : "$gt"]: 0
                    }
                }
            ];
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

        const data = vouchers.map((voucher) => ({
            id: voucher._id,
            code: voucher.code,
            discount_type: voucher.discount_type,
            discount_value: voucher.discount_value,
            min_order_value: voucher.min_order_value,
            max_discount: voucher.max_discount,
            start_date: voucher.start_date,
            end_date: voucher.end_date,
            status: voucher.status,
            quantity: voucher.quantity,
            user_id: voucher.user_id,
        }));

        return { status: 200, message: "Success", data: data, total: vouchersTotal.length }
    } catch (error) {
        console.log(error);
        throw error;
    }
}