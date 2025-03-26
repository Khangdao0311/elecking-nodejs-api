var proptypeModel = require("../models/proptype");

const { ObjectId } = require("mongodb");

module.exports = {
    getById,
    getQuery
};

async function getById(id) {
    try {
        const proptype = await proptypeModel.findById(id);
        if (!proptype) return { status: 400, message: "PropType không tồn tại !" }

        const data = {
            id: proptype._id,
            name: proptype.name,
        };

        return { status: 200, messgae: "Success", data: data }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function getQuery(query) {
    try {
        const { id, search, orderby, page = 1, limit = '' } = query

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
            const [sort, so] = orderby.split("-");
            sortCondition[sort == "id" ? "_id" : sort] = so ? so == "desc" ? -1 : 1 : -1;
        } else {
            sortCondition._id = -1;
        }

        const pipeline = [
            { $match: matchCondition },
            { $sort: sortCondition },
        ];

        const pipelineTotal = [
            { $match: matchCondition },
            { $sort: sortCondition },
        ];

        if (+limit && !isNaN(+limit)) {
            const skip = (page - 1) * limit;
            pipeline.push({ $skip: skip },);
            pipeline.push({ $limit: +limit });
        }

        const proptypes = await proptypeModel.aggregate(pipeline);
        const proptypesTotal = await proptypeModel.aggregate(pipelineTotal);

        const data = proptypes.map((proptype) => ({
            id: proptype._id,
            name: proptype.name,
        }));

        return { status: 200, message: "Success", data: data, total: proptypesTotal.length };
    } catch (error) {
        console.log(error);
        throw error;
    }
}