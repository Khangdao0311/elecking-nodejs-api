var propertyModel = require("../models/property");
var proptypeModel = require("../models/proptype");

const { ObjectId } = require("mongodb");

module.exports = {
    getById,
    getQuery,
    getTotalPagesByQuery
};

async function getById(id) {
    try {
        const property = await propertyModel.findById(id);
        if (!property) return { status: 400, message: "Property không tồn tại !" }

        const proptype = await proptypeModel.findById(property.proptype_id)

        const data = {
            id: property._id,
            name: property.name,
            proptype: {
                id: proptype._id,
                name: proptype.name
            },
        };

        return { status: 200, message: "Thành công !", data: data }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function getQuery(query) {
    try {
        const { id, search, type, orderby, page = 1, limit = null } = query;

        let matchCondition = {};

        if (search) {
            matchCondition.name = {
                $regex: search,
                $options: "i",
            };
        }

        if (type) {
            matchCondition.type = {
                $regex: type,
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

        if (limit && !isNaN(+limit)) {
            const skip = (page - 1) * limit;
            pipeline.push({ $skip: skip },);
            pipeline.push({ $limit: +limit });
        }

        const properties = await propertyModel.aggregate(pipeline);

        const data = []

        for (const property of properties) {
            const proptype = await proptypeModel.findById(property.proptype_id)
            data.push({
                id: property._id,
                name: property.name,
                proptype: {
                    id: proptype._id,
                    name: proptype.name
                },
            })
        }

        return { status: 200, message: "Thành công !", data: data }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function getTotalPagesByQuery(query) {
    try {
        const { id, search, type, limit = null } = query;

        let matchCondition = {};

        if (search) {
            matchCondition.name = {
                $regex: search,
                $options: "i",
            };
        }

        if (type) {
            matchCondition.type = {
                $regex: type,
                $options: "i",
            };
        }

        if (id) {
            matchCondition._id = {
                $in: id.split("-").map((_id) => new ObjectId(_id)),
            };
        }

        const pipeline = [
            { $match: matchCondition },
        ];

        const properties = await propertyModel.aggregate(pipeline);

        let data = 0;

        if (limit && !isNaN(+limit)) data = Math.ceil(properties.length / limit)

        return { status: 200, message: "Thành công !", data: data }
    } catch (error) {
        console.log(error);
        throw error;
    }
}