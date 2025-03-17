var orderModel = require("../models/order");

module.exports = {
    getQuery
};

async function getQuery(query) {
    try {
        const { year } = query;

        if (!year) return { status: 400, message: "Nhập số Năm cần thống kê !" }

        const orders = await orderModel.aggregate([
            {
                $match: {
                    ordered_at: { $regex: `^${year}` } // Chỉ lấy các đơn hàng có năm 2025
                }
            },
            {
                $group: {
                    _id: { $substr: ["$ordered_at", 4, 2] }, // Lấy tháng từ ordered_at
                    total: { $sum: "$total" }, // Tổng số tiền theo tháng
                    orderCount: { $sum: 1 } // Đếm số lượng đơn hàng theo tháng
                }
            },
            {
                $project: {
                    _id: 0,
                    month: { $toInt: "$_id" },
                    total: 1,
                    orderCount: 1
                }
            },
            {
                $facet: {
                    salesData: [
                        {
                            $group: {
                                _id: null,
                                result: {
                                    $push: {
                                        k: { $toString: "$month" },
                                        v: { price: "$total", order: "$orderCount" }
                                    }
                                },
                                totalPrice: { $sum: "$total" }, // Tổng tiền của cả năm
                                totalOrder: { $sum: "$orderCount" } // Tổng đơn hàng của cả năm
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                data: { $arrayToObject: "$result" },
                                totalPrice: 1,
                                totalOrder: 1
                            }
                        }
                    ],
                    allMonths: [
                        {
                            $project: {
                                data: {
                                    $arrayToObject: [
                                        [
                                            { k: "1", v: { price: 0, order: 0 } },
                                            { k: "2", v: { price: 0, order: 0 } },
                                            { k: "3", v: { price: 0, order: 0 } },
                                            { k: "4", v: { price: 0, order: 0 } },
                                            { k: "5", v: { price: 0, order: 0 } },
                                            { k: "6", v: { price: 0, order: 0 } },
                                            { k: "7", v: { price: 0, order: 0 } },
                                            { k: "8", v: { price: 0, order: 0 } },
                                            { k: "9", v: { price: 0, order: 0 } },
                                            { k: "10", v: { price: 0, order: 0 } },
                                            { k: "11", v: { price: 0, order: 0 } },
                                            { k: "12", v: { price: 0, order: 0 } }
                                        ]
                                    ]
                                }
                            }
                        }
                    ]
                }
            },
            {
                $project: {
                    mergedData: {
                        $mergeObjects: [
                            { $arrayElemAt: ["$allMonths.data", 0] },
                            { $arrayElemAt: ["$salesData.data", 0] }
                        ]
                    },
                    totalPrice: { $arrayElemAt: ["$salesData.totalPrice", 0] },
                    totalOrder: { $arrayElemAt: ["$salesData.totalOrder", 0] }
                }
            },
            {
                $replaceRoot: { newRoot: { $mergeObjects: ["$mergedData", { totalPrice: "$totalPrice", totalOrder: "$totalOrder" }] } }
            }
        ]);


        var data;

        if (JSON.stringify(orders[0]) == "{}") {
            data = {
                "1": {
                    "price": 0,
                    "order": 0
                },
                "2": {
                    "price": 0,
                    "order": 0
                },
                "3": {
                    "price": 0,
                    "order": 0
                },
                "4": {
                    "price": 0,
                    "order": 0
                },
                "5": {
                    "price": 0,
                    "order": 0
                },
                "6": {
                    "price": 0,
                    "order": 0
                },
                "7": {
                    "price": 0,
                    "order": 0
                },
                "8": {
                    "price": 0,
                    "order": 0
                },
                "9": {
                    "price": 0,
                    "order": 0
                },
                "10": {
                    "price": 0,
                    "order": 0
                },
                "11": {
                    "price": 0,
                    "order": 0
                },
                "12": {
                    "price": 0,
                    "order": 0
                },
                "total": 0
            };
        } else {
            data = orders[0]
        }

        return { status: 200, message: "Success", data: data }
    } catch (error) {
        console.log(error);
        throw error;
    }
}