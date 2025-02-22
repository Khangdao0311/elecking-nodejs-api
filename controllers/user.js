var userModel = require("../models/user");

const { ObjectId } = require("mongodb");

module.exports = {
    getAll,
    getById,
    getQuery
};

async function getAll() {
    try {
        const users = await userModel.find().sort({ _id: -1 });
        return users.map((user) => ({
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
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function getById(id) {
    try {
        const user = await userModel.findById(id);
        return {
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
        };
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
            sortCondition[sort] = so == "desc" ? -1 : 1;
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
        return data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}