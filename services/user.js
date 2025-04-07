var fs = require("fs")
var userModel = require("../models/user");

module.exports = {
    updateStatus, updateProfile
};

async function updateStatus(id, body) {
    try {
        const user = await userModel.findById(id)
        if (!user) return { status: 400, message: "Người dùng không tồn tại !" }

        const { role, status } = body

        if (![0, 1].includes(+role)) return { status: 400, message: "Vai trò không tồn tại !" }
        if (![0, 1, 2, 3].includes(+status)) return { status: 400, message: "Trạng thái không tồn tại !" }

        const data = await userModel.findByIdAndUpdate(id, {
            $set: {
                role: +role,
                status: +status,
            }
        }, { new: true })

        return { status: 200, message: "Success", data: data }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function updateProfile(id, body) {
    try {
        const user = await userModel.findById(id)
        if (!user) return { status: 400, message: "Người dùng không tồn tại !" }

        const { fullname, email, phone = '', avatar } = body

        const checkEmail = await userModel.findOne({ email: email, _id: { $ne: user._id } })
        if (checkEmail) return { status: 400, message: "Trùng Email !" }

        if (phone) {
            const checkPhone = await userModel.findOne({ phone: phone, _id: { $ne: user._id } })
            if (checkPhone) return { status: 400, message: "Trùng Số điện thoại !" }
        }

        if (user.avatar !== "" && user.avatar !== avatar) {
            fs.unlink(`./public/images/${user.avatar}`, function (err) {
                if (err) return console.log(err);
                console.log("file deleted successfully");
            });
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