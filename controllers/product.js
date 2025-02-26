
const productModel = require("../models/product");
const brandModel = require("../models/brand");
const categoryModel = require("../models/category");
const propertyModel = require("../models/property");

const { ObjectId } = require("mongodb");

module.exports = {
    getById,
    getQuery,
    getTotalPageByQuery,
    getSame
};

async function getById(id) {
    try {
        const product = await productModel.findById(id);
        if (!product) return { status: 400, message: "Sản phẩm không tồn tại !" }

        const variants = [];

        for (const variant of product.variants) {

            // lấy tên của property
            const propertyNames = [];
            for (const property_id of variant.property_ids) {
                const property = await propertyModel.findById(property_id);
                propertyNames.push(property?.name);
            }

            // thêm variant vào variants
            variants.push({
                properties: propertyNames,
                price_extra: variant.price_extra,
                price_sale: variant.price_sale,
                colors: variant.colors.map((color) => ({
                    name: color.name,
                    image: `${process.env.URL}${color.image}`,
                    price_extra: color.price_extra,
                    status: product.status,
                    quantity: color.quantity,
                })),
            });
        }

        const brand = await brandModel.findById(product.brand_id)
        const category = await categoryModel.findById(product.category_id)

        const data = {
            id: product._id,
            name: product.name,
            images: product.images.map((image) => `${process.env.URL}${image}`),
            price: product.price,
            variants: variants,
            view: product.view,
            description: product.description,
            brand: {
                id: brand._id,
                name: brand.name
            },
            category: {
                id: category._id,
                name: category.name
            },
        };

        return { status: 200, message: "Thành công !", data: data }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function getQuery({ search, id, categoryid, price, orderby, page = 1, limit = 5 }) {
    try {
        let matchCondition = {};

        // Tìm kiếm sản phẩm theo tên
        if (search) {
            matchCondition.name = {
                $regex: search,
                $options: "i",
            };
        }

        // Tìm kiếm sản phẩm theo nhiều id nối bằng dâu '-'
        if (id) {
            matchCondition._id = {
                $in: id.split("-").map((_id) => new ObjectId(_id)),
            };
        }

        // Tìm kiếm sản phẩm theo nhiều id danh mục nối bằng dấu '-'
        if (categoryid) {
            matchCondition.category_id = {
                $in: categoryid.split("-").map((idCat) => new ObjectId(idCat)),
            };
        }

        // Tìm kiếm sản phẩm theo giá từ đên nối bằng dấu '-'
        if (price) {
            const [min, max] = price.split("-");
            matchCondition.finalPrice = {
                $gte: +min,
                $lte: +max,
            };
        }

        let sortCondition = {};

        // sắp xếp sản phẩm theo sort và so, nối bằng dấu '-'
        if (orderby) {
            const [sort, so] = orderby.split("-");
            switch (sort) {
                case "price":
                    sortCondition.finalPrice = so ? so == "desc" ? -1 : 1 : -1;
                    break;

                case "sale":
                    sortCondition.percent = so ? so == "desc" ? -1 : 1 : -1;
                    break;

                default:
                    sortCondition[sort] = so ? so == "desc" ? -1 : 1 : -1;
                    break;
            }
        } else {
            sortCondition._id = -1;
        }

        const skip = (page - 1) * limit;

        const pipeline = [
            {
                $addFields: {
                    finalPrice: {
                        $subtract: [
                            { $add: ["$price", { $ifNull: [{ $arrayElemAt: ["$variants.price_extra", 0] }, 0] }] },
                            { $ifNull: [{ $arrayElemAt: ["$variants.price_sale", 0] }, 0] }
                        ]
                    },
                    percent: {
                        $round: [
                            {
                                $multiply: [
                                    {
                                        $divide: [
                                            {
                                                $subtract: [
                                                    "$price",
                                                    {
                                                        $subtract: [
                                                            { $add: ["$price", { $ifNull: [{ $arrayElemAt: ["$variants.price_extra", 0] }, 0] }] },
                                                            { $ifNull: [{ $arrayElemAt: ["$variants.price_sale", 0] }, 0] }
                                                        ]
                                                    }
                                                ]
                                            },
                                            "$price"
                                        ]
                                    },
                                    100
                                ]
                            },
                            0 // Làm tròn số nguyên
                        ]
                    }
                }
            },
            { $match: matchCondition },
            { $sort: sortCondition },
            { $skip: skip },
            { $limit: +limit }
        ];

        const products = await productModel.aggregate(pipeline);

        const data = [];

        for (const product of products) {

            const variants = [];

            for (const variant of product?.variants) {

                const propertyNames = [];

                for (const property_id of variant.property_ids) {
                    const property = await propertyModel.findById(property_id);
                    propertyNames.push(property?.name);
                }

                variants.push({
                    properties: propertyNames,
                    price_extra: variant.price_extra,
                    price_sale: variant.price_sale,
                    colors: variant.colors.map((color) => ({
                        name: color.name,
                        image: `${process.env.URL}${color.image}`,
                        price_extra: color.price_extra,
                        status: product.status,
                        quantity: color.quantity,
                    })),
                });
            }

            const brand = await brandModel.findById(product.brand_id)
            const category = await categoryModel.findById(product.category_id)

            data.push({
                id: product._id,
                name: product.name,
                images: product.images.map((image) => `${process.env.URL}${image}`),
                price: product.price,
                variants: variants,
                view: product.view,
                description: product.description,
                brand: {
                    id: brand._id,
                    name: brand.name
                },
                category: {
                    id: category._id,
                    name: category.name
                },
            });
        }

        return { status: 200, message: "Thành công !", data: data }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function getTotalPageByQuery({ search, id, categoryid, price, limit = 5 }) {
    try {
        let matchCondition = {};

        // Tìm kiếm sản phẩm theo tên
        if (search) {
            matchCondition.name = {
                $regex: search,
                $options: "i",
            };
        }

        // Tìm kiếm sản phẩm theo nhiều id nối bằng dâu '-'
        if (id) {
            matchCondition._id = {
                $in: id.split("-").map((_id) => new ObjectId(_id)),
            };
        }

        // Tìm kiếm sản phẩm theo nhiều id danh mục nối bằng dấu '-'
        if (categoryid) {
            matchCondition.category_id = {
                $in: categoryid.split("-").map((idCat) => new ObjectId(idCat)),
            };
        }

        // Tìm kiếm sản phẩm theo giá từ đên nối bằng dấu '-'
        if (price) {
            const [min, max] = price.split("-");
            matchCondition.finalPrice = {
                $gte: +min,
                $lte: +max,
            };
        }

        const pipeline = [
            {
                $addFields: {
                    finalPrice: {
                        $subtract: [
                            { $add: ["$price", { $ifNull: [{ $arrayElemAt: ["$variants.price_extra", 0] }, 0] }] },
                            { $ifNull: [{ $arrayElemAt: ["$variants.price_sale", 0] }, 0] }
                        ]
                    },
                    percent: {
                        $round: [
                            {
                                $multiply: [
                                    {
                                        $divide: [
                                            {
                                                $subtract: [
                                                    "$price",
                                                    {
                                                        $subtract: [
                                                            { $add: ["$price", { $ifNull: [{ $arrayElemAt: ["$variants.price_extra", 0] }, 0] }] },
                                                            { $ifNull: [{ $arrayElemAt: ["$variants.price_sale", 0] }, 0] }
                                                        ]
                                                    }
                                                ]
                                            },
                                            "$price"
                                        ]
                                    },
                                    100
                                ]
                            },
                            0 // Làm tròn số nguyên
                        ]
                    }
                }
            },
            { $match: matchCondition },
        ];

        const products = await productModel.aggregate(pipeline);

        const data = Math.ceil(products.length / limit);

        return { status: 200, message: "Thành công !", data: data }
        } catch (error) {
        console.log(error);
        throw error;
    }
}

async function getSame(query) {
    try {

        const { id, limit = 5 } = query

        const product = await productModel.findById(id);
        if (!product) return { status: 400, message: "Sản phẩm không tồn tại !" }

        const category = await categoryModel.findById(product.category_id);

        const productsSame = await productModel
            .find({ category_id: category._id, _id: { $ne: product._id } })
            .sort({ _id: -1 })
            .limit(limit);

        const data = [];

        for (const product of productsSame) {

            const variants = [];

            for (const variant of product.variants) {

                const propertyNames = [];

                for (const property_id of variant.property_ids) {
                    const property = await propertyModel.findById(property_id);
                    propertyNames.push(property?.name);
                }

                variants.push({
                    properties: propertyNames,
                    price_extra: variant.price_extra,
                    price_sale: variant.price_sale,
                    colors: variant.colors.map((color) => ({
                        name: color.name,
                        image: `${process.env.URL}${color.image}`,
                        price_extra: color.price_extra,
                        status: product.status,
                        quantity: color.quantity,
                    })),
                });
            }

            const brand = await brandModel.findById(product.brand_id)
            const category = await categoryModel.findById(product.category_id)

            data.push({
                id: product._id,
                name: product.name,
                images: product.images.map((image) => `${process.env.URL}${image}`),
                price: product.price,
                variants: variants,
                view: product.view,
                description: product.description,
                brand: {
                    id: brand._id,
                    name: brand.name
                },
                category: {
                    id: category._id,
                    name: category.name
                },
            });
        }

        return { status: 200, message: "Thành công !", data: data }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

// async function insert(body) {
//   try {
//     const { name, images, price, variants, sale, description, category_id } = body;
//     const category = await categoryModel.findById(category_id);
//     if (!category) throw new Error("không tìm thấy danh mục ");
//     const productNew = new productModel({
//       name: name,
//       images: images,
//       price: Number(price),
//       variants: JSON.parse(variants),
//       sale: !!sale,
//       rating: 0,
//       view: 0,
//       description: description,
//       category_id: category._id,
//     });
//     const result = await productNew.save();
//     return result;
//   } catch (error) {
//     console.log(error);
//     throw error;
//   }
// }

// async function update(id, body) {
//   try {
//     const product = await productModel.findById(id);
//     if (!product) throw new Error("Không Tìm Thấy Sản Phẩm !");

//     const { name, images, imagesOld, price, variants, sale, description, category_id } = body;

//     product.images.forEach((image) => {
//       if (!JSON.parse(imagesOld).includes(image)) {
//         fs.unlink(`./public/images/${image}`, function (err) {
//           if (err) return console.log(err);
//           console.log("file deleted successfully");
//         });
//       }
//     });

//     product.variants.forEach((type, iType) => {
//       type.colors.forEach((color, iColor) => {
//         if (JSON.parse(variants)[iType].colors[iColor].image !== color.image)
//           fs.unlink(`./public/images/${color.image}`, function (err) {
//             if (err) return console.log(err);
//             console.log("file deleted successfully");
//           });
//       });
//     });

//     let categoryFind = null;
//     if (category_id) {
//       categoryFind = await categoryModel.findById(category_id);
//       if (!categoryFind) throw new Error("không tìm thấy danh mục ");
//     }
//     const categoryUpdate = categoryFind ? categoryFind._id : product.category_id;

//     const imagesNew = [];
//     imagesNew.push(...JSON.parse(imagesOld));
//     if (images) imagesNew.push(...images);

//     const result = await productModel.findByIdAndUpdate(
//       id,
//       {
//         name: name,
//         images: imagesNew,
//         price: Number(price),
//         variants: JSON.parse(variants),
//         sale: !!sale,
//         rating: product.rating,
//         view: product.view,
//         description: description,
//         category_id: categoryUpdate,
//       },
//       { new: true }
//     );

//     return result;
//   } catch (error) {
//     console.log(error);
//     throw error;
// }
// }

// async function cancel(id) {
//     try {
//         const product = await productModel.findById(id);
//         if (!product) throw new Error("Sản phẩm không tồn tại !");
//         product.images.forEach((image) => {
//             fs.unlink(`./public/images/${image}`, function (err) {
//                 if (err) return console.log(err);
//                 console.log("file deleted successfully");
//             });
//         });
//         product.variants.forEach((type) => {
//             type.colors.forEach((color) => {
//                 fs.unlink(`./public/images/${color.image}`, function (err) {
//                     if (err) return console.log(err);
//                     console.log("file deleted successfully");
//                 });
//             });
//         });
//         const result = await productModel.findByIdAndDelete(id);
//         return result;
//     } catch (error) {
//         console.log(error);
//         throw error;
//     }
// }
