var addressModel = require("../models/address");
var userModel = require("../models/user");

const { ObjectId } = require("mongodb");

module.exports = {
    getById,
    getQuery
};

async function getById(id) {
    try {
        const address = await addressModel.findById(id);
        if (!address) return { status: 400, message: "Địa chỉ không tồn tại !" }

        const data = {
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
        };

        return { status: 200, message: "Success", data: data }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function getQuery(query) {
    try {
        const { id, user_id, search, status = "1", orderby, page = 1, limit = '' } = query;

        let matchCondition = {};

        if (search) {
            matchCondition.fullname = {
                $regex: search,
                $options: "i",
            };
        }

        if (id) {
            matchCondition._id = {
                $in: id.split("-").map((_id) => new ObjectId(_id)),
            };
        }

        if (user_id) {
            const user = await userModel.findById(user_id)
            if (!user) return { status: 400, message: "Người dùng không tồn tại !" }
            matchCondition.user_id = user._id
        }

        if (status) {
            matchCondition.status = +status
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
            pipeline.push({ $skip: skip },);
            pipeline.push({ $limit: +limit });
        }

        const pipelineTotal = [
            { $match: matchCondition },
        ];

        const addresss = await addressModel.aggregate(pipeline);
        const addresssTotal = await addressModel.aggregate(pipelineTotal);

        const data = addresss.map((address) => ({
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
        }));

        return { status: 200, message: "Success", data: data, total: addresssTotal.length }
    } catch (error) {
        console.log(error);
        throw error;
    }
}