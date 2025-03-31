var orderModel = require("../models/order");

module.exports = {
    getQuery
};

async function getQuery(query) {
    try {
        const { year } = query;
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth() + 1; // Lấy tháng hiện tại (1-12)

        let monthsToInclude = [];

        if (year) {
            monthsToInclude = Array.from({ length: 12 }, (_, i) => ({
                month: (i + 1).toString().padStart(2, "0"),
                year: year,
            }));
        } else {
            for (let i = 0; i < 6; i++) {
                let month = currentMonth - i;
                let yearVal = currentYear;
                if (month <= 0) {
                    month += 12;
                    yearVal -= 1;
                }
                monthsToInclude.push({ month: month.toString().padStart(2, "0"), year: yearVal.toString() });
            }
        }

        // 🔹 Lọc theo danh sách tháng đã xác định
        const matchStage = {
            $match: {
                $or: monthsToInclude.map(({ month, year }) => ({
                    ordered_at: { $regex: `^${year}${month}` }
                }))
            }
        };

        const projectStage = {
            $project: {
                month: { $substr: ["$ordered_at", 4, 2] },
                year: { $substr: ["$ordered_at", 0, 4] },
                total: 1,
                payment_status: 1, // Thêm trạng thái thanh toán
            }
        };

        const groupStage = {
            $group: {
                _id: { month: "$month", year: "$year" },
                price: {
                    $sum: {
                        $cond: [{ $eq: ["$payment_status", true] }, "$total", 0] // Chỉ tính price nếu payment_status == true
                    }
                },
                order: { $sum: 1 }, // Tổng số order không cần điều kiện
            }
        };

        const sortStage = { $sort: { "_id.year": -1, "_id.month": -1 } };

        const pipeline = [matchStage, projectStage, groupStage, sortStage];

        // 🔹 Thực hiện aggregation
        const result = await orderModel.aggregate(pipeline).exec();

        // 🔹 Chuẩn bị dữ liệu JSON theo yêu cầu
        const response = {};
        let totalPrice = 0;
        let totalOrder = 0;

        // 🔹 Khởi tạo dữ liệu mặc định cho các tháng cần lấy
        monthsToInclude.forEach(({ month, year }) => {
            response[`${month}/${year}`] = { price: 0, order: 0 };
        });

        // 🔹 Cập nhật dữ liệu từ MongoDB
        result.forEach(({ _id, price, order }) => {
            const key = `${_id.month}/${_id.year}`;
            if (response[key]) {
                response[key].price = price;
                response[key].order = order;
                totalPrice += price;
                totalOrder += order;
            }
        });

        // 🔹 Thêm tổng price và order
        response.totalPrice = totalPrice;
        response.totalOrder = totalOrder;

        return { status: 200, message: "Success", data: response };
    } catch (error) {
        console.log(error);
        throw error;
    }

}

