
const productModel = require("../models/product");
const brandModel = require("../models/brand");
const categoryModel = require("../models/category");
const propertyModel = require("../models/property");

const { ObjectId } = require("mongodb");

module.exports = {
    getAll,
    getById,
    getQuery
};

async function getAll() {
    try {
        const products = await productModel.find().sort({ _id: -1 });

        const data = [];

        for (const product of products) {

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
                sale: product.sale,
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

        return data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function getById(id) {
    try {
        const product = await productModel.findById(id);

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

        return {
            id: product._id,
            name: product.name,
            images: product.images.map((image) => `${process.env.URL}${image}`),
            price: product.price,
            variants: variants,
            sale: product.sale,
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
    } catch (error) {
        console.log(error);
        throw error;
    }
}


async function getQuery(search, id, categoryid, sale, price, orderby, page = 1, limit = 5) {
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

        if (categoryid) {
            matchCondition.category_id = {
                $in: categoryid.split("-").map((idCat) => new ObjectId(idCat)),
            };
        }

        if (sale) {
            matchCondition.sale = true;
        }

        if (price) {
            const [min, max] = price.split("-");
            matchCondition.finalPrice = {
                $gte: +min,
                $lte: +max,
            };
        }

        let sortCondition = {};

        if (orderby) {
            const [sort, so] = orderby.split("-");
            sortCondition[sort] = so == "desc" ? -1 : 1;
        } else {
            sortCondition._id = -1;
        }

        const skip = (page - 1) * limit;

        const pipeline = [
            {
                $addFields: {
                    finalPrice: {
                        $subtract: [
                            { $add: ["$price", { $arrayElemAt: ["$variants.price_extra", 0] }] },
                            { $arrayElemAt: ["$variants.price_sale", 0] },
                        ],
                    },
                },
            },
            { $match: matchCondition },
            { $sort: sortCondition },
            { $skip: skip },
            { $limit: +limit },
        ];

        const products = await productModel.aggregate(pipeline);

        const data = [];

        for (const product of products) {

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
                sale: product.sale,
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

        return data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}


// async function getSame(id, limit) {
//   try {
//     const product = await productModel.findById(id);
//     if (!product) throw new Error("Sản phẩm không tồn tại !");
//     const category = await categoryModel.findById(product.category_id);
//     const productsSame = await productModel
//       .find({ category_id: category._id, _id: { $ne: product._id } })
//       .sort({ _id: -1 })
//       .limit(limit);
//     const data = productsSame.map((product) => ({
//       id: product._id,
//       name: product.name,
//       images: product.images.map((image) => `${process.env.URL}${image}`),
//       price: product.price,
//       variants: product.variants.map((type) => ({
//         name: type.name,
//         price_extra: type.price_extra,
//         price_sale: type.price_sale,
//         price_update: type.price_update,
//         colors: type.colors.map((color) => ({
//           name: color.name,
//           image: `${process.env.URL}${color.image}`,
//           price_extra: color.price_extra,
//           quantity: color.quantity,
//         })),
//       })),
//       rating: product.rating,
//       view: product.view,
//       sale: product.sale,
//       description: product.description,
//       category_id: product.category_id,
//     }));
//     return data;
//   } catch (error) {
//     console.log(error);
//     throw error;
//   }
// }

// async function getTotalPagesQuery(search, categoryid, sale, price, limit = 5) {
//   try {
//     let matchCondition = {};

//     if (search) {
//       matchCondition.name = {
//         $regex: search,
//         $options: "i",
//       };
//     }
//     if (categoryid) {
//       matchCondition.category_id = {
//         $in: categoryid.split("-").map((idCat) => new ObjectId(idCat)),
//       };
//     }

//     if (sale) {
//       matchCondition.sale = true;
//     }

//     if (price) {
//       const [min, max] = price.split("-");
//       matchCondition.finalPrice = {
//         $gte: +min,
//         $lte: +max,
//       };
//     }

//     let sortCondition = {};

//     const pipeline = [
//       {
//         $addFields: {
//           finalPrice: {
//             $subtract: [
//               { $add: ["$price", { $arrayElemAt: ["$variants.price_extra", 0] }] },
//               { $arrayElemAt: ["$variants.price_sale", 0] },
//             ],
//           },
//         },
//       },
//       { $match: matchCondition },
//     ];

//     const products = await productModel.aggregate(pipeline);

//     const data = Math.ceil(products.length / limit);

//     return data;
//   } catch (error) {
//     console.log(error);
//     throw error;
//   }
// }

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
