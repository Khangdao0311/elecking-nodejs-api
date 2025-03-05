var categoryModel = require("../models/category");

const { ObjectId } = require("mongodb");

module.exports = {
    getById,
    getQuery,
    getTotalPagesByQuery
};

async function getById(id) {
    try {
        const category = await categoryModel.findById(id);
        if (!category) return { status: 400, message: "Danh mục không tồn tại !" }

        const data = {
            id: category._id,
            name: category.name,
            image: `${process.env.URL}${category.image}`,
            status: category.status,
            properties: category.properties,
            description: category.description,
        };

        return { status: 200, messgae: "Thành công !", data: data }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function getQuery({ id, search, orderby, page = 1, limit = 5 }) {
    try {
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

        const skip = (page - 1) * limit;

        const pipeline = [
            { $match: matchCondition },
            { $sort: sortCondition },
            { $skip: skip },
            { $limit: +limit },
        ];

        const categories = await categoryModel.aggregate(pipeline);

        const data = categories.map((category) => ({
            id: category._id,
            name: category.name,
            image: `${process.env.URL}${category.image}`,
            status: category.status,
            properties: category.properties,
            description: category.description,
        }));

        return { status: 200, message: "Thành công !", data: data };
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function getTotalPagesByQuery({ id, search, limit = 5 }) {
    try {
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

        const pipeline = [
            { $match: matchCondition },
        ];

        const categories = await categoryModel.aggregate(pipeline);

        const data = Math.ceil(categories.length / limit);

        return { status: 200, message: "Thành công !", data: data };
    } catch (error) {
        console.log(error);
        throw error;
    }
}