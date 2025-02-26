var addressModel = require("../models/address");

const { ObjectId } = require("mongodb");

module.exports = {
    getById,
    getQuery
};

async function getById(id) {
    try {
        const address = await addressModel.findById(id);
        return {
            id: address._id,
            province: address.province,
            district: address.district,
            ward: address.ward,
            description: address.description,
            phone: address.phone,
            fullname: address.fullname,
            type: address.type,
            default: address.name,
            user_id: address.user_id,
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

        const addresss = await addressModel.aggregate(pipeline);

        const data = addresss.map((address) => ({
            id: address._id,
            province: address.province,
            district: address.district,
            ward: address.ward,
            description: address.description,
            phone: address.phone,
            fullname: address.fullname,
            type: address.type,
            default: address.default,
            user_id: address.user_id,
        }));
        return data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}