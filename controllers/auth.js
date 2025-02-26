var bcryptjs = require("bcryptjs");
var jwt = require("jsonwebtoken");
var userModel = require("../models/user");

const { ObjectId } = require("mongodb");

module.exports = {
    login
};

async function login(body) {
    try {

        const { account, password } = body

        const user = await userModel.findOne({
            $or: [{ username: account }, { email: account }, { phone: account }],
        });

        console.log(account, password);


        if (user) {
            if (bcryptjs.compareSync(password, user.password)) {
                const data = {
                    id: user._id,
                    fullname: user.username,
                    avatar: `${process.env.URL}${user.avatar}`,
                    email: user.email,
                    phone: user.phone,
                    username: user.username,
                    cart: user.cart,
                    wish: user.wish
                };
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

