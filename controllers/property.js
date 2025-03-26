var propertyModel = require("../models/property");
var proptypeModel = require("../models/proptype");

const { ObjectId } = require("mongodb");

module.exports = {
    getById,
    getQuery
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

        return { status: 200, message: "Success", data: data }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function getQuery(query) {
    try {
        const { id, search, proptype_id, orderby, page = 1, limit = '' } = query;

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
        
        if (proptype_id) {
            matchCondition.proptype_id = {
                $in: proptype_id.split("-").map((_proptype_id) => new ObjectId(_proptype_id)),
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

        const properties = await propertyModel.aggregate(pipeline);
        const propertiesTotal = await propertyModel.aggregate(pipelineTotal);

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

        return { status: 200, message: "Success", data: data, total: propertiesTotal.length }
    } catch (error) {
        console.log(error);
        throw error;
    }
}