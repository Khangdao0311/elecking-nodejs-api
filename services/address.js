var addressModel = require("../models/address");
var userModel = require("../models/user");
const { parsePhoneNumberFromString } = require("libphonenumber-js");

module.exports = {
    insert,
    update
};

async function insert(body) {
    try {
        const { province, district, ward, description, phone, fullname, type, setDefault = false, user_id } = body

        const user = await userModel.findById(user_id)
        if (!user) return { status: 400, message: "người dùng không tồn tại !" }

        if (!province) return { status: 400, message: "Không có trường province (Tỉnh / Thành Phố)" }
        if (!district) return { status: 400, message: "Không có trường district (Quận / Huyện)" }
        if (!ward) return { status: 400, message: "Không có trường ward (Phường / Xã)" }
        if (!description) return { status: 400, message: "Không có trường description (Tên đường - địa chỉ chi tiết)" }
        if (!phone) return { status: 400, message: "Không có trường phone (Số điện thoại)" }
        if (!fullname) return { status: 400, message: "Không có trường fullname (Họ và Tên)" }
        if (!type) return { status: 400, message: "Không có trường type (Loại địa chỉ (Nhà riêng - văn phòng))" }
        if (![1, 2].includes(+type)) return { status: 400, message: "Loại địa chỉ không hợp lệ !" }

        const addresses = await addressModel.find({ user_id: user._id })

        if (addresses.length && setDefault) {
            await addressModel.updateMany(
                { user_id: user._id },
                { $set: { setDefault: false } }
            );
        }

        const addressNew = new addressModel({
            province: province,
            district: district,
            ward: ward,
            description: description,
            phone: phone,
            fullname: fullname,
            type: type,
            setDefault: addresses.length ? true : setDefault,
            user_id: user._id,
        })

        await addressNew.save()

        return { status: 200, message: "Thành công !" }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function update(id, body) {
    try {
        const address = await addressModel.findById(id)
        if (!address) return { status: 400, message: "Địa chỉ không tồn tại !" }

        const { province, district, ward, description, phone, fullname, type, setDefault = false } = body

        if (![1, 2].includes(+type)) return { status: 400, message: "Loại địa chỉ không hợp lệ !" }

        const addresses = await addressModel.find({ user_id: address.user_id })
        if (addresses.length && setDefault === "true") {
            await addressModel.updateMany(
                { user_id: address.user_id },
                { $set: { setDefault: false } }
            );
        }

        await addressModel.findByIdAndUpdate(id, {
            $set: {
                rovince: province,
                district: district,
                ward: ward,
                description: description,
                phone: phone,
                fullname: fullname,
                type: type,
                setDefault: address.setDefault || setDefault,
            }
        }, { new: true })

        return { status: 200, message: "Thành công !" }
    } catch (error) {
        console.log(error);
        throw error;
    }
}