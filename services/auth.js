var bcryptjs = require("bcryptjs");
var moment = require("moment");
var jwt = require("jsonwebtoken");
var { ObjectId } = require('mongodb')
var fs = require("fs")

var userModel = require("../models/user");
var productModel = require("../models/product");
var orderModel = require("../models/order");
var addressModel = require("../models/address");
var payment_methodModel = require("../models/payment_method");
var { sendMailer } = require('./email')

module.exports = {
    login,
    register,
    updateCart,
    updateWish,
    getToken,
    loginAdmin,
    changePassword,
    forgotPassword,
    resetPassword,
    updateProfile,
    cancelOrder,
    removeAddress
};

async function login(body) {
    try {
        const { account, password } = body

        const user = await userModel.findOne({
            $or: [{ username: account }, { email: account }, { phone: account }],
        });

        if (user) {
            if (bcryptjs.compareSync(password, user.password)) {
                if (user.status) {
                    const userToken = {
                        id: user._id,
                        fullname: user.fullname,
                        username: user.username,
                        email: user.email,
                        phone: user.phone,
                        role: user.role
                    }

                    const access_token = jwt.sign({ user: userToken }, process.env.JWTSECRET, {
                        expiresIn: "30s",
                    });
                    const refresh_token = jwt.sign({ user: userToken }, process.env.JWTSECRET, {
                        expiresIn: "8h",
                    });

                    const data = {
                        user: {
                            id: user._id,
                            fullname: user.fullname,
                            avatar: user.avatar ? `${process.env.URL_IMAGE}${user.avatar}` : "",
                            email: user.email,
                            phone: user.phone,
                            username: user.username,
                        },
                        access_token: access_token,
                        refresh_token: refresh_token
                    }

                    return { status: 200, message: 'Success', data: data }
                } else {
                    return { status: 400, message: 'Tài khoản bạn đã bị khóa !' }
                }
            } else {
                return { status: 400, message: 'Đăng nhập thất bại !' }
            }


        } else {
            return { status: 400, message: 'Người dùng không tồn tại !' }
        }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function loginAdmin(body) {
    try {
        const { account, password } = body

        const user = await userModel.findOne({
            $or: [{ username: account }, { email: account }, { phone: account }],
        });

        if (user) {
            if (user.role === 1) {
                if (bcryptjs.compareSync(password, user.password)) {
                    if (user.status === 1) {
                        if (user.status) {
                            const userToken = {
                                id: user._id,
                                username: user.username,
                                fullname: user.fullname,
                                role: user.role
                            }

                            const access_token = jwt.sign({ user: userToken }, process.env.JWTSECRET, {
                                expiresIn: "30s",
                            });
                            const refresh_token = jwt.sign({ user: userToken }, process.env.JWTSECRET, {
                                expiresIn: "8h",
                            });

                            const data = {
                                user: {
                                    id: user._id,
                                    username: user.username,
                                    fullname: user.fullname,
                                    avatar: user.avatar ? `${process.env.URL_IMAGE}${user.avatar}` : "",
                                    email: user.email,
                                    phone: user.phone,
                                },
                                access_token: access_token,
                                refresh_token: refresh_token
                            }

                            return { status: 200, message: 'Success', data: data }
                        } else {
                            return { status: 403, message: 'Tài khoản bạn đã bị khóa !' }
                        }
                    } else {
                        return { status: 400, message: 'Tài khoản bạn đã bị khóa !' }
                    }
                } else {
                    return { status: 400, message: 'Đăng nhập thất bại !' }
                }

            } else {
                return { status: 403, message: 'Không có quyền truy cập' }
            }
        } else {
            return { status: 403, message: 'Tài khoản không tồn tại !' }
        }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function register(body) {
    try {
        const { fullname, email, phone = '', username, password } = body

        if (!fullname) return { status: 400, message: "Trường fullname bị trống !" }
        if (!email) return { status: 400, message: "Bắt buộc phải có trường email hoặc số điện thoại !" }
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

async function changePassword(id, body) {
    try {
        const { passwordOld, passwordNew } = body

        const user = await userModel.findById(id)

        if (!passwordOld || !passwordNew) return { status: 400, message: "Không đủ dữ liệu để đổi mật khẩu !" }

        if (user) {
            if (bcryptjs.compareSync(passwordOld, user.password)) {

                const salt = bcryptjs.genSaltSync(10);
                const hash = bcryptjs.hashSync(passwordNew, salt);

                await userModel.findByIdAndUpdate(user._id, {
                    $set: { password: hash, }
                })

                return { status: 200, message: "Success" }
            } else {
                return { status: 400, message: 'Mật khẩu người dùng không đúng !' }
            }
        } else {
            return { status: 400, message: 'Tài khoản không tồn tại !' }
        }
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
                expiresIn: "30s",
            });

            return { status: 200, message: "Success", data: access_token }
        });
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function forgotPassword(body) {
    try {
        const { email } = body

        const user = await userModel.findOne({ email: email });

        if (!user) return { status: 400, message: 'Tài khoản không tồn tại !' }

        const token = jwt.sign({
            user: {
                id: user._id,
                fullname: user.fullname,
                username: user.username,
                email: user.email,
            }
        }, process.env.JWTSECRET, {
            expiresIn: "2m",
        });

        await sendMailer('"Elecking"<elecking.store@gmail.com>', email, `Thiết Lập Lại mật khẩu`, `
                 <div style="margin: 0 auto; width: 600px;">
                    <p>Xin chào <strong>${user.username}</strong>,</p>
                    <p>Chúng tôi nhận được yêu cầu thiết lập lại mật khẩu cho tài khoản Elecking của bạn.</p>
                    <p>Nhấn <a href="${process.env.URL}/reset-password/${token}" style="color: red; text-decoration: none; font-weight: bold;">tại đây</a> để thiết lập mật khẩu mới cho tài khoản Elecking của bạn.</p>
                    <p>Hoặc vui lòng copy và dán đường dẫn bên dưới lên trình duyệt: <a href="${process.env.URL}/reset-password/${token}" style="color: blue; word-wrap: break-word;">${process.env.URL}/auth/forgot-password/change/${token}</a></p>
                    <p>Trân trọng,</p>
                    <p><strong>Elecking</strong></p>
                </div>
            `)

        return { status: 200, message: 'Success' }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function resetPassword(body) {
    try {
        const { token, passwordNew } = body

        if (!token) return { status: 400, message: 'Token không tồn tại !' }
        if (!passwordNew) return { status: 400, message: 'Không đủ trường !' }

        const decoded = jwt.decode(token);

        // (!decoded || !decoded.exp)
        if (!decoded) return { status: 401, message: "Invalid Refresh Token" }

        const expirationTime = decoded.exp * 1000;
        const currentTime = Date.now();

        if (currentTime > expirationTime) return { status: 401, message: "Refresh Token Expired" }

        return await jwt.verify(token, process.env.JWTSECRET, async (error, data) => {
            if (error) {
                return ({ status: 401, message: "Invalid Refresh Token" });
            }

            const salt = bcryptjs.genSaltSync(10);
            const hash = bcryptjs.hashSync(passwordNew, salt);

            await userModel.findByIdAndUpdate(data.user.id, {
                $set: {
                    password: hash,
                }
            }, { new: true, runValidators: true })

            return { status: 200, message: "Success" }
        });

    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function updateProfile(id, body) {
    try {
        const user = await userModel.findById(id)
        if (!user) return { status: 400, message: "Người dùng không tồn tại !" }

        const { fullname, email, phone = '', avatar = '' } = body

        const checkEmail = await userModel.findOne({ email: email, _id: { $ne: user._id } })
        if (checkEmail) return { status: 400, message: "Email đã được sử dụng !" }

        if (phone) {
            const checkPhone = await userModel.findOne({ phone: phone, _id: { $ne: user._id } })
            if (checkPhone) return { status: 400, message: "Số điện thoại đã được sử dụng !" }
        }

        if (avatar) {
            if (user.avatar !== "" && user.avatar !== avatar) {
                fs.unlink(`./public/images/${user.avatar}`, function (err) {
                    if (err) return console.log(err);
                    console.log("file deleted successfully");
                });
            }
        }

        const userSet = {
            fullname: fullname,
            email: email,
            phone: phone
        }

        if (avatar) {
            userSet.avatar = avatar
        }

        const userNew = await userModel.findByIdAndUpdate(id, {
            $set: userSet
        }, { new: true })

        const data = {
            id: userNew._id,
            fullname: userNew.fullname,
            avatar: userNew.avatar ? `${process.env.URL_IMAGE}${userNew.avatar}` : "",
            email: userNew.email,
            phone: userNew.phone,
            username: userNew.username,
        }

        return { status: 200, message: "Success", data: data }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function cancelOrder(id) {
    try {
        const order = await orderModel.findById(id)
        if (!order) return { status: 400, message: "Đơn hàng không tồn tại !" }
        if (order.status !== 2 || order.payment_status === true) return { status: 400, message: "Đơn hàng này không được hủy !" }

        const date = new Date();
        const updated_at = moment(date).format('YYYYMMDDHHmmss');

        await orderModel.findByIdAndUpdate(order._id,
            {
                $set: {
                    status: 0,
                    updated_at: updated_at
                }
            },
            { new: true, runValidators: true })

        for (const productOrder of order.products) {
            const product = await productModel.findById(productOrder.product.id)
            await productModel.findByIdAndUpdate(product._id, {
                $set: {
                    variants: product.variants.map((variant, iVariant) => {
                        if (iVariant == productOrder.product.variant) return {
                            ...variant.toObject(),
                            colors: variant.colors.map((color, iColor) => {
                                if (iColor == productOrder.product.color) return {
                                    ...color.toObject(),
                                    status: 1,
                                    quantity: color.quantity + productOrder.quantity
                                }

                                return color
                            })
                        }
                        return variant
                    })
                }
            }, { new: true, runValidators: true })
        }

        const user = await userModel.findById(order.user_id)
        const address = await addressModel.findById(order.address_id)
        const payment_method = await payment_methodModel.findById(order.payment_method_id)

        await sendMailer('"Elecking"<elecking.store@gmail.com>', "elecking.store@gmail.com", `Đã Hủy Đơn hàng ${id.toUpperCase()} của ${user.fullname}`, `
                    <div style="padding: 10px;">
                    <h1 style="text-align: center;">Thông Tin Đơn Hàng Đã Hủy</h1>
                    <p style="font-size: 18px;">Mẫ đơn hàng: <b style="font-size: 24px;">${id.toUpperCase()}</b></p>
                    <p>Khách hàng: <b>${user.fullname}</b></p>
                    <p>Email: <b>${user.email}</b></p>
                    <p>Số điện thoại: <b>${user.phone}</b></p>
                    <hr>
                    <p>Địa chỉ: <b>${address.province.name}, ${address.district.name}, ${address.ward.name}, ${address.description}</b></p>
                    <p>Tên người nhận: <b>${address.fullname}</b></p>
                    <p>Số điện thoại: <b>${address.phone}</b></p>
                    <p>Loại địa chỉ: <b>${address.type == 1 ? "Nhà Riêng" : "Văn Phòng"}</b></p>
                    <hr>
                    <p>Phương thức thanh toán: <b>${payment_method.name}</b></p>
                    <p>Giá trị đơn hàng: <b>${(order.total).toLocaleString("vi-VN")} đ</b></p>
                    <p>Lưu ý: <b>${order.note}</b></p>
                </div>
            `)

        return { status: 200, message: "Success" }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function removeAddress(id) {
    try {
        const address = await addressModel.findById(id)
        if (!address) return { status: 400, message: "Địa chỉ không tồn tại !" }

        await addressModel.findByIdAndUpdate(id, {
            $set: {
                status: 0,
                setDefault: false
            }
        }, { new: true })

        const addresses = await addressModel.find({ user_id: address.user_id, status: 1 }).sort({ _id: 1 })

        const checkDefault = await addressModel.findOne({
            user_id: address.user_id,
            status: { $ne: 0 },
            setDefault: true
        }) ? true : false


        if (addresses.length > 0 && !checkDefault) {
            await addressModel.findByIdAndUpdate(addresses[0]._id, {
                $set: {
                    setDefault: true
                }
            }, { new: true })
        }

        return { status: 200, message: "Success" }
    } catch (error) {
        console.log(error);
        throw error;
    }
}