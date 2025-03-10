var bcryptjs = require("bcryptjs");
var moment = require("moment");
var jwt = require("jsonwebtoken");
var userModel = require("../models/user");
var { ObjectId } = require('mongodb')

module.exports = {
    login,
    register,
    updateCart,
    updateWish
};

async function login(body) {
    try {
        const { account, password } = body

        const user = await userModel.findOne({
            $or: [{ username: account }, { email: account }, { phone: account }],
        });

        if (user) {
            if (bcryptjs.compareSync(password, user.password)) {
                const data = {
                    id: user._id,
                    fullname: user.username,
                    avatar: user.avatar ? `${process.env.URL}${user.avatar}` : "",
                    email: user.email,
                    phone: user.phone,
                    username: user.username,
                    cart: user.cart,
                    wish: user.wish
                };

                // const access_token = jwt.sign({ user: data }, process.env.JWTSECRET, {
                //     expiresIn: "10s",
                // });
                // const refresh_token = jwt.sign({ user: data }, process.env.JWTSECRET);

                return { status: 200, message: 'Thành công !', data: data }

            } else {
                return { status: 401, message: 'Mật khẩu người dùng không đúng !' }
            }
        } else {
            return { status: 400, message: 'Người dùng không tồn tại !' }
        }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function register(body) {
    try {
        const { fullname, email = '', phone = '', username, password } = body

        if (!fullname) return { status: 400, message: "Trường fullname bị trống !" }
        if (!email && !phone) return { status: 400, message: "Bắt buộc phải có trường email hoặc số điện thoại !" }
        if (!username) return { status: 400, message: "Trường tên đăng nhập bị trống !" }
        if (!password) return { status: 400, message: "Trường mật khẩu bị trống !" }

        const checkEmail = await userModel.find({
            $and: [
                { email: email },
                { email: { $ne: "" } }
            ]
        })
        if (checkEmail.length) return { status: 400, message: "Địa chỉ Email đã tồn tại !" }

        const checkPhone = await userModel.find({
            $and: [
                { phone: phone },
                { phone: { $ne: "" } }
            ]
        })
        if (checkPhone.length) return { status: 400, message: "Số điện thoại đã tồn tại !" }

        const checkUsername = await userModel.find({ username: username })
        if (checkUsername.length) return { status: 400, message: "Tên đăng nhập đã tồn tại !" }

        const date = new Date();
        const register_date = moment(date).format('YYYYMMDDHHmmss');

        const salt = bcryptjs.genSaltSync(10);
        const hash = bcryptjs.hashSync(password, salt);

        const userNew = new userModel({
            fullname: fullname,
            avatar: '',
            email: email,
            phone: phone,
            username: username,
            password: hash,
            role: 0,
            status: 1,
            register_date: register_date,
            cart: [],
            wish: [],
        })

        await userNew.save()

        return { status: 200, message: "Thành công !" }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function updateCart(id, body) {
    try {
        const { cart } = body



        const user = await userModel.findById(id)
        if (!user) return { status: 400, message: "Người dùng không tồn tại !" }

        if (!Array.isArray(JSON.parse(cart))) return { status: 400, message: "Cart không phải là mảng !" }

        const cartNew = JSON.parse(cart).map(c => ({
            ...c,
            product: {
                ...c.product,
                id: new ObjectId(c.product.id)
            }
        }))

        await userModel.findByIdAndUpdate(id, { $set: { cart: cartNew } }, { new: true, runValidators: true })

        return { status: 200, message: "Thành công !" }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function updateWish(id, body) {
    try {
        const { wish } = body

        const user = await userModel.findById(id)
        if (!user) return { status: 400, message: "Người dùng không tồn tại !" }

        if (!Array.isArray(JSON.parse(wish))) return { status: 400, message: "Wish không phải là mảng !" }

        const wishNew = JSON.parse(wish).map(c => ({
            ...c,
            product: {
                ...c.product,
                id: new ObjectId(c.product.id)
            }
        }))

        await userModel.findByIdAndUpdate(id, { $set: { wish: wishNew } }, { new: true, runValidators: true })

        return { status: 200, message: "Thành công !" }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

[{ "product": { "id": "67b96ee667788c638a22e2c7", "variant": 0, "color": 0 } }]