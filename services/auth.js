var bcryptjs = require("bcryptjs");
var moment = require("moment");
var jwt = require("jsonwebtoken");
var userModel = require("../models/user");
var productModel = require("../models/product");
var { ObjectId } = require('mongodb')

module.exports = {
    login,
    register,
    updateCart,
    updateWish,
    getToken
};

async function login(body) {
    try {
        const { account, password } = body

        const user = await userModel.findOne({
            $or: [{ username: account }, { email: account }, { phone: account }],
        });

        if (user) {
            if (bcryptjs.compareSync(password, user.password)) {
                const userToken = {
                    id: user._id,
                    fullname: user.username,
                    username: user.username,
                    role: user.role
                }

                const access_token = jwt.sign({ user: userToken }, process.env.JWTSECRET, {
                    expiresIn: "30s",
                });
                const refresh_token = jwt.sign({ user: userToken }, process.env.JWTSECRET, {
                    expiresIn: "4h",
                });

                const data = {
                    user: {
                        id: user._id,
                        fullname: user.fullname,
                        avatar: user.avatar ? `${process.env.URL}${user.avatar}` : "",
                        email: user.email,
                        phone: user.phone,
                        username: user.username,
                    },
                    access_token: access_token,
                    refresh_token: refresh_token
                }

                return { status: 200, message: 'Success', data: data }

            } else {
                return { status: 400, message: 'Mật khẩu người dùng không đúng !' }
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

        return { status: 200, message: "Success" }
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

        return { status: 200, message: "Success" }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function updateWish(id, body) {
    try {
        const { product_id } = body

        const user = await userModel.findById(id)
        if (!user) return { status: 400, message: "Người dùng không tồn tại !" }

        const product = await productModel.findById(product_id)
        if (!product) return { status: 400, message: "Sản phẩm không tồn tại !" }

        let check = user.wish.some(e => e.equals(product._id))

        let wishNew = []

        if (check) {
            wishNew = [...user.wish].filter(e => !e.equals(product._id))
        } else {
            user.wish.push(product._id)
            wishNew = user.wish
        }

        await userModel.findByIdAndUpdate(id, { $set: { wish: wishNew } }, { new: true, runValidators: true })

        return { status: 200, message: "Success" }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function getToken(body) {
    try {
        const { refresh_token } = body

        const decoded = jwt.decode(refresh_token);

        // (!decoded || !decoded.exp)
        if (!decoded) return { status: 401, message: "Invalid Refresh Token" }

        const expirationTime = decoded.exp * 1000;
        const currentTime = Date.now();

        if (currentTime > expirationTime) return { status: 401, message: "Refresh Token Expired" }

        return await jwt.verify(refresh_token, process.env.JWTSECRET, (error, data) => {
            if (error) {
                return res.status(401).json({ status: 401, message: "Invalid Refresh Token" });
            }

            const access_token = jwt.sign({ user: data.user }, process.env.JWTSECRET, {
                expiresIn: "10s",
            });
            console.log(access_token);

            return { status: 200, message: "Success", data: access_token }
        });
        // throw new Error("???");
    } catch (error) {
        console.log(error);
        throw error;
    }
}