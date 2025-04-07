const orderModel = require("../models/order");
var reviewModel = require("../models/review");
var userModel = require("../models/user");

const { ObjectId } = require("mongodb");

module.exports = {
    getById,
    getQuery
};

async function getById(id) {
    try {
        const review = await reviewModel.findById(id);
        if (!review) return { status: 400, message: "review không tồn tại !" }

        const order = await orderModel.findById(review.order_id)
        const user = await userModel.findById(order.user_id)

        const data = {
            id: review._id,
            content: review.content,
            images: review.images.length == 0 ? [] : review.images.map((image) => `${process.env.URL_IMAGE}${image}`),
            rating: review.rating,
            created_at: review.created_at,
            updated_at: review.updated_at,
            like: review.like,
            order_id: review.order_id,
            product_id: review.product_id,
            user: {
                id: user._id,
                avatar: user.avatar ? `${process.env.URL_IMAGE}${user.avatar}` : "",
                fullname: user.fullname
            }
        };

        return { status: 200, message: "Success", data: data }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function getQuery(query) {
    try {
        const { product_id, rating, orderby, page = 1, limit = '' } = query;

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

        const pipelineStatusCount = [];
        if (product_id) pipelineStatusCount.push({ $match: { product_id: new ObjectId(product_id) } });
        pipelineStatusCount.push({ $group: { _id: "$rating", count: { $sum: 1 } } });

        const matchConditionTotal = {};
        if (product_id) matchConditionTotal.product_id = new ObjectId(product_id);

        const reviews = await reviewModel.aggregate(pipeline);
        const reviewsTotal = await reviewModel.aggregate(pipelineTotal);

        const statusCounts = await reviewModel.aggregate(pipelineStatusCount);
        const totalCounts = await reviewModel.aggregate([{ $match: matchConditionTotal }]);

        const totalByStatus = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
        statusCounts.forEach(item => {
            totalByStatus[item._id] = item.count;
        });

        const data = [];

        for (const review of reviews) {

            const order = await orderModel.findById(review.order_id)
            const user = await userModel.findById(order.user_id)

            data.push({
                id: review._id,
                content: review.content,
                images: review.images.length == 0 ? [] : review.images.map((image) => `${process.env.URL_IMAGE}${image}`),
                rating: review.rating,
                created_at: review.created_at,
                updated_at: review.updated_at,
                like: review.like,
                order_id: review.order_id,
                product_id: review.product_id,
                user: {
                    id: user._id,
                    avatar: user.avatar ? `${process.env.URL_IMAGE}${user.avatar}` : "",
                    fullname: user.fullname
                }
            })

        }

        return {
            status: 200, message: "Success", data: data, total: reviewsTotal.length, totalReview: {
                "all": totalCounts.length,
                ...totalByStatus
            }
        }
    } catch (error) {
        console.log(error);
        throw error;
    }
}