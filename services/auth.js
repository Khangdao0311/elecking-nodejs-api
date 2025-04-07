var bcryptjs = require("bcryptjs");
var moment = require("moment");
var jwt = require("jsonwebtoken");
var { ObjectId } = require('mongodb')
var nodemailer = require("nodemailer");

var userModel = require("../models/user");
var productModel = require("../models/product");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "elecking.store@gmail.com",
        pass: "zauy tcqh mvjh frtj"
    }
});

module.exports = {
    login,
    register,
    updateCart,
    updateWish,
    getToken,
    loginAdmin,
    changePassword,
    forgotPassword,
    resetPassword
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
                        return { status: 400, message: 'Tài khoản bạn đã bị khóa !' }
                    }
                } else {
                    return { status: 400, message: 'Mật khẩu người dùng không đúng !' }
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
                expiresIn: "10s",
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

        const mailOptions = {
            from: '"Elecking"<elecking.store@gmail.com>',
            to: email,
            subject: `Thiết Lập Lại mật khẩu`,
            html: `
                 <div style="margin: 0 auto; width: 600px;">
                    <p>Xin chào <strong>${user.username}</strong>,</p>
                    <p>Chúng tôi nhận được yêu cầu thiết lập lại mật khẩu cho tài khoản Elecking của bạn.</p>
                    <p>Nhấn <a href="${process.env.URL}/auth/reset-password/${token}" style="color: red; text-decoration: none; font-weight: bold;">tại đây</a> để thiết lập mật khẩu mới cho tài khoản Elecking của bạn.</p>
                    <p>Hoặc vui lòng copy và dán đường dẫn bên dưới lên trình duyệt: <a href="${process.env.URL}/auth/reset-password/${token}" style="color: blue; word-wrap: break-word;">${process.env.URL}/auth/forgot-password/change/${token}</a></p>
                    <p>Trân trọng,</p>
                    <p><strong>Elecking</strong></p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
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