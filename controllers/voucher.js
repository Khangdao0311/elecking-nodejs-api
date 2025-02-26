var voucherModel = require("../models/voucher");

const { ObjectId } = require("mongodb");

module.exports = {
    getById,
    getQuery
};

async function getById(id) {
    try {
        const voucher = await voucherModel.findById(id);
        return {
            id: voucher._id,
            code: voucher.code,
            discount_type: voucher.discount_type,
            discount_value: voucher.discount_value,
            min_order_value: voucher.min_order_value,
            max_discount: voucher.max_discount,
            stare_date: voucher.stare_date,
            end_date: voucher.end_date,
            status: voucher.status,
            quantity: voucher.quantity,
            user_id: voucher.user_id,
        };
    } catch (error) {
        console.log(error);
        throw error;
    }
}


async function getQuery(query) {
    try {
        const { id, search, orderby, page = 1, limit = 5 } = query;

        let matchCondition = {};

        if (search) {
            matchCondition.name = {
                $regex: search,
                $options: "i",
            };
        }

        if (id) {
            matchCondition._id = {
                $in: id.split("-").map((_id) => new ObjectId(_id)),
            };
        }

        let sortCondition = {};

        if (orderby) {
            const [sort, so] = sort.split("-");
            sortCondition[sort] = so == "desc" ? -1 : 1;
        } else {
            sortCondition._id = -1;
        }

        const skip = (page - 1) * limit;

        const pipeline = [
            { $match: matchCondition },
            { $sort: sortCondition },
            { $skip: skip },
            { $limit: +limit },
        ];

        const vouchers = await voucherModel.aggregate(pipeline);

        const data = vouchers.map((voucher) => ({
            id: voucher._id,
            code: voucher.code,
            discount_type: voucher.discount_type,
            discount_value: voucher.discount_value,
            min_order_value: voucher.min_order_value,
            max_discount: voucher.max_discount,
            stare_date: voucher.stare_date,
            end_date: voucher.end_date,
            status: voucher.status,
            quantity: voucher.quantity,
            user_id: voucher.user_id,
        }));
        return data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}