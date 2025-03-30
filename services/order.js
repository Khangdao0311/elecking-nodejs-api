const { ObjectId } = require("mongodb");
const moment = require("moment");
var nodemailer = require("nodemailer");

var orderModel = require("../models/order");
var userModel = require("../models/user");
var voucherModel = require("../models/voucher");
var payment_methodModel = require("../models/payment_method");
var addressModel = require("../models/address");
var productModel = require("../models/product");
var propertyModel = require("../models/property");

module.exports = {
    create,
    updateTransactionCode,
    updateStatus
};

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "elecking.store@gmail.com",
        pass: "zauy tcqh mvjh frtj"
    }
});

async function create(body) {
    try {
        const { total, price_ship, note, products, user_id, voucher_id = null, payment_method_id, address_id } = body

        const user = await userModel.findById(user_id)
        if (!user) return { status: 400, message: "Người dùng không tồn tại !" }

        const payment_method = await payment_methodModel.findById(payment_method_id)
        if (!payment_method) return { status: 400, message: "Phương thức thanh toán không tồn tại !" }

        const address = await addressModel.findById(address_id)
        if (!address) return { status: 400, message: "Địa chỉ không tồn tại !" }

        if (voucher_id) {
            const voucher = await voucherModel.findById(voucher_id)
            if (!voucher) return { status: 400, message: "Voucher không tồn tại !" }
            if (+total < +voucher.min_order_value) return { status: 400, message: `Đơn hàng không đủ điều kiện để áp dụng voucher ${voucher.code}` }
            await voucherModel.findByIdAndUpdate(voucher._id, { $set: { quantity: voucher.quantity - 1, status: voucher.quantity - 1 === 0 ? 0 : 1 } }, { new: true, runValidators: true })
        }

        const date = new Date();
        const ordered_at = moment(date).format('YYYYMMDDHHmmss');

        const orderNew = new orderModel({
            total: +total,
            status: 2,
            payment_status: false,
            ordered_at: ordered_at,
            updated_at: ordered_at,
            transaction_code: "",
            price_ship: +price_ship,
            note: note,
            products: JSON.parse(products).map(product => ({
                ...product,
                product: {
                    id: new ObjectId(product.product_id),
                    ...product.product
                },
                reviewed: false
            })),
            user_id: new ObjectId(user_id),
            voucher_id: voucher_id ? new ObjectId(voucher_id) : null,
            payment_method_id: payment_method_id,
            address_id: new ObjectId(address_id)
        });

        let productsOrder = '';

        for (const [index, productOrder] of JSON.parse(products).entries()) {
            const product = await productModel.findById(productOrder.product.id)

            const properties = [];
            for (const property_id of product.variants[productOrder.product.variant].property_ids) {
                const property = await propertyModel.findById(property_id);
                properties.push(property?.name);
            }

            await productModel.findByIdAndUpdate(product._id, {
                $set: {
                    variants: product.variants.map((variant, iVariant) => {
                        if (iVariant == productOrder.product.variant) return {
                            ...variant.toObject(),
                            colors: variant.colors.map((color, iColor) => {
                                if (iColor == productOrder.product.color) return {
                                    ...color.toObject(),
                                    status: color.quantity - productOrder.quantity === 0 ? 0 : color.status,
                                    quantity: color.quantity - productOrder.quantity
                                }
                                return color
                            })
                        }
                        return variant
                    })
                }
            },
                { new: true, runValidators: true })

            productsOrder += `
                <tr>
                    <td style="padding: 5px; text-align: center;">${index + 1}</td>
                    <td style="padding: 5px; ">${productOrder.product.id}</td>
                    <td style="padding: 5px; ">${product.name}</td>
                    <td style="padding: 5px; text-align: center;">${productOrder.quantity}</td>
                    <td style="padding: 5px; text-align: center;">${properties.join(" - ")}</td>
                    <td style="padding: 5px; text-align: center;">${product.variants[productOrder.product.variant].colors[productOrder.product.color].name}</td>
                </tr>
            `
        }

        const mailOptions = {
            from: '"Elecking"<elecking.store@gmail.com>',
            to: "elecking.store@gmail.com",
            subject: `Đơn hàng của ${user.fullname}`,
            html: `
                 <div style="padding: 10px;">
                    <h1 style="text-align: center;">Thông Tin Đơn Hàng</h1>
                    <p style="font-size: 18px;">Khách hàng: <b style="font-size: 24px;">${user.fullname}</b></p>
                    <p>Email: <b>${user.email}</b></p>
                    <p>Số điện thoại: <b>${user.phone}</b></p>
                    <hr>
                    <p>Địa chỉ: <b>${address.province.name}, ${address.district.name}, ${address.ward.name}, ${address.description}</b></p>
                    <p>Tên người nhận: <b>${address.fullname}</b></p>
                    <p>Số điện thoại: <b>${address.phone}</b></p>
                    <p>Loại địa chỉ: <b>${address.type == 1 ? "Nhà Riêng" : "Văn Phòng"}</b></p>
                    <hr>
                    <p>Phương thức thanh toán: <b>${payment_method.name}</b></p>
                    <p>Giá trị đơn hàng: <b>${(+total).toLocaleString("vi-VN")} đ</b></p>
                    <p>Lưu ý: <b>${note}</b></p>
                    <hr>
                    <p style="font-size: 18px; font-weight: bold;">Đơn hàng</p>
                    <table border="1" style="width: 100%;">
                        <thead>
                            <tr>
                                <th style="padding: 5px; width: 50px;">STT</th>
                                <th style="padding: 5px;">ID Sản Phẩm</th>
                                <th style="padding: 5px;">Tên sản phẩm</th>
                                <th style="padding: 5px;">Số lượng</th>
                                <th style="padding: 5px;">Loại</th>
                                <th style="padding: 5px;">Màu sắc</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${productsOrder}
                        </tbody>
                    </table>


                </div>
            `
        };

        const data = await orderNew.save();

        await transporter.sendMail(mailOptions);

        return { status: 200, message: "Success", data: data }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function updateTransactionCode(id, body) {
    try {
        const { transaction_code } = body

        if (!transaction_code) return { status: 400, message: "Mã thanh toán không tồn tại !" }

        const order = await orderModel.findById(id)
        if (!order) return { status: 400, message: "Đơn hàng không tồn tại !" }

        const date = new Date();
        const updated_at = moment(date).format('YYYYMMDDHHmmss');

        await orderModel.findByIdAndUpdate(id,
            {
                $set: {
                    transaction_code: transaction_code,
                    payment_status: true,
                    updated_at: updated_at
                }
            },
            { new: true, runValidators: true })

        return { status: 200, message: "Success" }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function updateStatus(id, body) {
    try {
        const { status } = body

        if (![0, 1, 2, 3, 4].includes(+status)) return { status: 400, message: "Trạng thái không hợp lệ !" }

        const order = await orderModel.findById(id)
        if (!order) return { status: 400, message: "Đơn hàng không tồn tại !" }

        if (order.status === 0) return { status: 400, message: "Đơn hàng đã bị hủy !" }

        const date = new Date();
        const updated_at = moment(date).format('YYYYMMDDHHmmss');

        const update = {
            status: +status,
            updated_at: updated_at
        }

        if (+status === 1) update.payment_status = true

        await orderModel.findByIdAndUpdate(order._id,
            {
                $set: update
            },
            { new: true, runValidators: true })

        if (+status === 0) {
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

            const mailOptions = {
                from: '"Elecking"<elecking.store@gmail.com>',
                to: "elecking.store@gmail.com",
                subject: `Đã Hủy Đơn hàng ${id.toUpperCase()} của ${user.fullname}`,
                html: `
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
                        <p>Lưu ý: <b>${note}</b></p>
                    </div>
                `
            };
            await transporter.sendMail(mailOptions);

        }

        return { status: 200, message: "Success" }
    } catch (error) {
        console.log(error);
        throw error;
    }
}