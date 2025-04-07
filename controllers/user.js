var userModel = require("../models/user");

const { ObjectId } = require("mongodb");

module.exports = {
    getById,
    getQuery
};

async function getById(id) {
    try {
        const user = await userModel.findById(id);
        if (!user) return { status: 400, message: "Người dùng không tồn tại !" }

        const data = {
            id: user._id,
            fullname: user.fullname,
            avatar: user.avatar ? `${process.env.URL_IMAGE}${user.avatar}` : "",
            email: user.email,
            phone: user.phone,
            username: user.username,
            role: user.role,
            status: user.status,
            register_date: user.register_date,
            cart: user.cart,
            wish: user.wish,
        }

        return { status: 200, message: "Success", data: data }

    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function getQuery(query) {
    try {
        const { id, search, orderby,  page = 1, limit = '' } = query;

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

        const users = await userModel.aggregate(pipeline);
        const usersTotal = await userModel.aggregate(pipelineTotal);

        const data = users.map((user) => ({
            id: user._id,
            fullname: user.fullname,
            avatar: user.avatar ? `${process.env.URL_IMAGE}${user.avatar}` : "",
            email: user.email,
            phone: user.phone,
            username: user.username,
            role: user.role,
            status: user.status,
            register_date: user.register_date,
            // cart: user.cart,
            // wish: user.cart,
        }));

        return { status: 200, message: "Success", data: data, total: usersTotal.length };
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function getTotalPagesByQuery(query) {
    try {
        const { id, search, limit = 5 } = query;

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

        const pipeline = [
            { $match: matchCondition },
        ];

        const users = await userModel.aggregate(pipeline);

        const data = Math.ceil(users.length / limit);

        return { status: 200, message: "Success", data: data };
    } catch (error) {
        console.log(error);
        throw error;
    }
}