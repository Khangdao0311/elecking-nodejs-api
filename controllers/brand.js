var brandModel = require("../models/brand");

module.exports = {
    getAll,
    getById,
};

async function getAll() {
    try {
        const brands = await brandModel.find().sort({ _id: -1 });
        return brands.map((brand) => ({
            id: brand._id,
            name: brand.name,
            logo: `${process.env.URL}${brand.logo}`,
            benner: `${process.env.URL}${brand.benner}`,
            status: brand.status,
            description: brand.description,
        }));
    } catch (error) {
        console.log(error);
        throw error;
    }
}

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