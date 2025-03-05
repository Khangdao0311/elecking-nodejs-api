var reviewModel = require("../models/review");

const { ObjectId } = require("mongodb");

module.exports = {
    getById,
    getQuery,
    getTotalPagesByQuery
};

async function getById(id) {
    try {
        const review = await reviewModel.findById(id);
        if (!review) return { status: 400, message: "review không tồn tại !" }

        const data = {
            id: review._id,
            content: review.content,
            images: review.images.length == 0 ? [] : review.images.map((image) => `${process.env.URL}${image}`),
            rating: review.rating,
            created_at: review.created_at,
            updated_at: review.updated_at,
            order_id: review.order_id,
            product_id: review.product_id,
            user_id: review.user_id
        };

        return { status: 200, message: "Thành công !", data: data }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function getQuery(query) {
    try {
        const { product_id, rating, orderby, page = 1, limit = 5 } = query;

        let matchCondition = {};

        if (product_id) {
            matchCondition.product_id = new ObjectId(product_id)
        }

        if (rating) {
            matchCondition.rating = +rating
        }


        let sortCondition = {};

        if (orderby) {
            const [sort, so] = orderby.split("-");
            sortCondition[sort == "id" ? "_id" : sort] = so ? so == "desc" ? -1 : 1 : -1;
        } else {
            sortCondition.rating = -1;
        }

        const skip = (page - 1) * limit;

        const pipeline = [
            { $match: matchCondition },
            { $sort: sortCondition },
            { $skip: skip },
            { $limit: +limit },
        ];

        const reviews = await reviewModel.aggregate(pipeline);

        const data = reviews.map((review) => ({
            id: review._id,
            content: review.content,
            images: review.images.length == 0 ? [] : review.images.map((image) => `${process.env.URL}${image}`),
            rating: review.rating,
            created_at: review.created_at,
            updated_at: review.updated_at,
            order_id: review.order_id,
            product_id: review.product_id,
            user_id: review.user_id
        }));

        return { status: 200, message: "Thành công !", data: data }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function getTotalPagesByQuery(query) {
    try {
        const { product_id, rating, limit = 5 } = query;

        let matchCondition = {};

        if (product_id) {
            matchCondition.product_id = new ObjectId(product_id)
        }

        if (rating) {
            matchCondition.rating = +rating
        }

        const pipeline = [
            { $match: matchCondition },
        ];

        const reviews = await reviewModel.aggregate(pipeline);

        const data = Math.ceil(reviews.length / limit);

        return { status: 200, message: "Thành công !", data: data }
    } catch (error) {
        console.log(error);
        throw error;
    }
}