var brandModel = require("../models/brand");

const { ObjectId } = require("mongodb");

module.exports = {
    getById,
    getQuery,
    getTotalPagesByQuery
};

async function getById(id) {
    try {
        const brand = await brandModel.findById(id);
        if (!brand) return { status: 400, message: "Thương hiệu không tồn tại !" }

        const data = {
            id: brand._id,
            name: brand.name,
            logo: `${process.env.URL}${brand.logo}`,
            banner: `${process.env.URL}${brand.banner}`,
            status: brand.status,
            description: brand.description,
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

        const brands = await brandModel.aggregate(pipeline);

        const data = brands.map((brand) => ({
            id: brand._id,
            name: brand.name,
            logo: `${process.env.URL}${brand.logo}`,
            banner: `${process.env.URL}${brand.banner}`,
            status: brand.status,
            description: brand.description,
        }));

        return { status: 200, message: "Thành công !", data: data }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function getTotalPagesByQuery(query) {
    try {
        const { id, search, limit = 5 } = query;

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

        const brands = await brandModel.aggregate(pipeline);

        const data = Math.ceil(brands.length / limit);

        return { status: 200, message: "Thành công !", data: data }
    } catch (error) {
        console.log(error);
        throw error;
    }
}