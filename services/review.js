const orderModel = require("../models/order");
const productModel = require("../models/product");
const reviewModel = require("../models/review");
const userModel = require("../models/user");

const moment = require('moment')

module.exports = {
    insert,
    like
};

async function insert(body) {
    try {
        const { content = "", images = [], rating, order_id, product_id, indexReview } = body

        const order = await orderModel.findById(order_id)
        if (!order) return { status: 400, message: "Đơn hàng không tồn tại !" }

        if (order.status !== 1) return { status: 400, message: "Đơn hàng chưa được giao Success" }

        const product = await productModel.findById(product_id)

        if (!product) return { status: 400, message: "Sản phẩm không tồn tại !" }

        const checkProductOrder = order.products.find(e => e.product.id.equals(product._id))
        if (!checkProductOrder) return { status: 400, message: "Sản phẩm đánh giá không trong đơn hàng !" }

        if (![0, 1, 2, 3, 4, 5].includes(+rating)) return { status: 400, message: "Đánh giá không tồn tại !" }

        const date = new Date()
        const created_at = moment(date).format('YYYYMMDDHHmmss');

        const reviewNew = new reviewModel({
            content: content,
            images: images,
            rating: rating,
            created_at: created_at,
            updated_at: created_at,
            order_id: order._id,
            product_id: product._id,
        })

        await reviewNew.save()

        const productsOrder = order.products.map((productOrder, index) => ({
            ...productOrder.toObject(),
            reviewed: index === +indexReview || productOrder.reviewed
        }))

        await orderModel.findByIdAndUpdate(order._id, { $set: { products: productsOrder } }, { new: true, runValidators: true })

        return { status: 200, message: "Success" }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function like(id, body) {
    try {
        const { user_id } = body

        const review = await reviewModel.findById(id)
        if (!review) return { status: 400, message: "Đánh giá không tồn tại !" }

        const user = await userModel.findById(user_id)
        if (!user) return { status: 400, message: "Người dùng không tồn tại !" }

        console.log(review.like);


        let check = review.like.some(e => e.equals(user._id))

        let likeNew = []

        if (check) {
            likeNew = [...review.like].filter(e => !e.equals(user._id))
        } else {
            review.like.push(user._id)
            likeNew = review.like
        }

        await reviewModel.findByIdAndUpdate(id, { $set: { like: likeNew } }, { new: true, runValidators: true })

        return { status: 200, message: "Success" }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

