var payment_methodModel = require("../models/payment_method");

const { ObjectId } = require("mongodb");

module.exports = {
    getById,
    getQuery
};

async function getById(id) {
    try {
        const payment_method = await payment_methodModel.findById(id);
        if (!payment_method) return { status: 400, message: "Phương thức thanh toán không tồn tại !" }

        const data = {
            id: payment_method._id,
            name: payment_method.name,
            description: payment_method.description,
        };

        return { status: 200, message: "Thành công !", data: data }
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

        const payment_methods = await payment_methodModel.aggregate(pipeline);

        const data = payment_methods.map((payment_method) => ({
            id: payment_method._id,
            name: payment_method.name,
            description: payment_methodModel.description,
        }));

        return { status: 200, message: "Thành công !", data: data }
    } catch (error) {
        console.log(error);
        throw error;
    }
}