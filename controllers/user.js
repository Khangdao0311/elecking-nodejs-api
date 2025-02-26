var userModel = require("../models/user");
var productModel = require("../models/product");

const { ObjectId } = require("mongodb");
const product = require("../models/product");

module.exports = {
    getById,
    getQuery,
    cart,
    wish
};

async function getById(id) {
    try {
        const user = await userModel.findById(id);
        if (!user) return { status: 400, message: "Người dùng không tồn tại !" }

        const data = {
            id: user._id,
            fullname: user.fullname,
            avatar: `${process.env.URL}${user.avatar}`,
            email: user.email,
            phone: user.phone,
            username: user.username,
            role: user.role,
            status: user.status,
            register_dat: user.register_dat,
            description: user.description,
            cart: user.cart,
            wish: user.cart,
        }

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
            matchCondition.$or = [
                { fullname: { $regex: search, $options: "i" } },
                { username: { $regex: search, $options: "i" } }
            ];
        }

        if (id) {
            matchCondition._id = {
                $in: id.split("-").map((_id) => new ObjectId(_id)),
            };
        }

        let sortCondition = {};

        if (orderby) {
            const [sort, so] = sort.split("-");
            sortCondition[sort] = so ? so == "desc" ? -1 : 1 : -1;
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

        const users = await userModel.aggregate(pipeline);

        const data = users.map((user) => ({
            id: user._id,
            fullname: user.fullname,
            avatar: `${process.env.URL}${user.avatar}`,
            email: user.email,
            phone: user.phone,
            username: user.username,
            role: user.role,
            status: user.status,
            register_dat: user.register_dat,
            description: user.description,
            cart: user.cart,
            wish: user.cart,
        }));

        return { status: 200, message: "Thành công !", data: data };
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function cart(body) {
    try {
        const { user_id, cart } = body

        const user = await userModel.findById(user_id)
        if (!user) return { status: 400, message: "Người dùng không tồn tại !" }

        const cartNew = JSON.parse(cart).map(c => ({
            ...c,
            product: {
                ...c.product,
                id: new ObjectId(c.product.id)
            }
        }))

        await userModel.findByIdAndUpdate(user_id, { $set: { cart: cartNew } }, { new: true, runValidators: true })

        return { status: 200, message: "Thành công !" }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function wish(body) {
    try {
        const { user_id, wish } = body

        const user = await userModel.findById(user_id)
        if (!user) return { status: 400, message: "Người dùng không tồn tại !" }

        const wishNew = JSON.parse(wish).map(c => ({
            ...c,
            product: {
                ...c.product,
                id: new ObjectId(c.product.id)
            }
        }))

        await userModel.findByIdAndUpdate(user_id, { $set: { wish: wishNew } }, { new: true, runValidators: true })

        return { status: 200, message: "Thành công !" }
    } catch (error) {
        console.log(error);
        throw error;
    }
}