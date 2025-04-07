var brandModel = require("../models/brand");

const { ObjectId } = require("mongodb");

module.exports = {
    getById,
    getQuery
};

async function getById(id) {
    try {
        const brand = await brandModel.findById(id);
        if (!brand) return { status: 400, message: "Thương hiệu không tồn tại !" }

        const data = {
            id: brand._id,
            name: brand.name,
            logo: brand.logo ? `${process.env.URL_IMAGE}${brand.logo}` : "",
            banner: brand.banner ? `${process.env.URL_IMAGE}${brand.banner}` : "",
            status: brand.status,
            description: brand.description,
        };

        return { status: 200, message: "Success", data: data }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function getQuery(query) {
    try {
        const { id, search, status = "1", orderby, page = 1, limit = '' } = query;

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

        const brands = await brandModel.aggregate(pipeline);
        const brandsTotal = await brandModel.aggregate(pipelineTotal);

        const data = brands.map((brand) => ({
            id: brand._id,
            name: brand.name,
            logo: brand.logo ? `${process.env.URL_IMAGE}${brand.logo}` : "",
            banner: brand.banner ? `${process.env.URL_IMAGE}${brand.banner}` : "",
            status: brand.status,
            description: brand.description,
        }));

        return { status: 200, message: "Success", data: data, total: brandsTotal.length }
    } catch (error) {
        console.log(error);
        throw error;
    }
}