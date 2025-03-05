const orderModel = require("../models/order");
const productModel = require("../models/product");
const userModel = require("../models/user");
const { ObjectId } = require("mongodb");

module.exports = {
    insert,
    update
};

async function insert(body) {
    try {
        const { content = "", images = '[]', rating, order_id, product_id, user_id } = body

        const order = await orderModel.findById(order_id)
        if (!order) return { status: 400, message: "Đơn hàng không tồn tại !" }

        const product = await productModel.findById(product_id)
        if (!product) return { status: 400, message: "Sản phẩm không tồn tại !" }

        const checkProductOrder = order.find(e => e.product_id.equals(product._id))
        if (!checkProductOrder) return { status: 400, message: "Sản phẩm đánh giá không trong đơn hàng !" }

        const user = await userModel.findById(user_id)
        if (!user) return { status: 400, message: "Người dùng không tồn tại !" }

        if (![0, 1, 2, 3, 4, 5].includes(+rating)) return { status: 400, message: "Đánh giá không tồn tại !" }

        if (!Array.isArray(JSON.parse(images))) return { status: 400, message: "Images không đúng dữ liệu !" }

        const date = new Date();
        const created_at = moment(date).format('YYYYMMDDHHmmss');

        const reviewNew = new reviewModel({
            content: content,
            images: (JSON.parse(images)),
            rating: rating,
            created_at: created_at,
            updated_at: created_at,
            order_id: order._id,
            product_id: product._id,
            user_id: user._id,
        })

        await reviewNew.save()

        return { status: 200, message: "Thành công !" }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function update(id, body) {
    try {
        const review = await reviewModel.findById(id)
        if (!review) return { status: 400, message: "Đánh giá không tồn tại !" }

        const { content, images, rating } = body

        if (!Array.isArray(JSON.parse(images))) return { status: 400, message: "Images không đúng dữ liệu !" }

        if (![0, 1, 2, 3, 4, 5].includes(+rating)) return { status: 400, message: "Đánh giá không tồn tại !" }

        await reviewModel.findByIdAndUpdate(id, {
            $set: {
                content: content,
                images: JSON.parse(images),
                rating: +rating,
            }
        }, { new: true })

        return { status: 200, message: "Thành công !" }
    } catch (error) {
        console.log(error);
        throw error;
    }
}