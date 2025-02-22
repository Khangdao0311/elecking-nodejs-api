var brandModel = require("../models/brand");

const { ObjectId } = require("mongodb");

module.exports = {
    getById,
    getQuery
};

async function getById(id) {
    try {
        const brand = await brandModel.findById(id);
        return {
            id: brand._id,
            name: brand.name,
            logo: `${process.env.URL}${brand.logo}`,
            benner: `${process.env.URL}${brand.benner}`,
            status: brand.status,
            description: brand.description,
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

        const brands = await brandModel.aggregate(pipeline);

        const data = brands.map((brand) => ({
            id: brand._id,
            name: brand.name,
            logo: `${process.env.URL}${brand.logo}`,
            benner: `${process.env.URL}${brand.benner}`,
            status: brand.status,
            description: brand.description,
        }));
        return data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}