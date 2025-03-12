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
                    _id: { $substr: ["$ordered_at", 4, 2] },
                    total: { $sum: "$total" }
                }
            },
            {
                $project: {
                    _id: 0,
                    month: { $toInt: "$_id" },
                    total: 1
                }
            },
            {
                $facet: {
                    salesData: [
                        {
                            $group: {
                                _id: null,
                                result: { $push: { k: { $toString: "$month" }, v: "$total" } },
                                total: { $sum: "$total" } // Tổng tất cả các tháng
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                data: { $arrayToObject: "$result" },
                                total: 1
                            }
                        }
                    ],
                    allMonths: [
                        {
                            $project: {
                                data: {
                                    $arrayToObject: [
                                        [
                                            { k: "1", v: 0 }, { k: "2", v: 0 }, { k: "3", v: 0 }, { k: "4", v: 0 },
                                            { k: "5", v: 0 }, { k: "6", v: 0 }, { k: "7", v: 0 }, { k: "8", v: 0 },
                                            { k: "9", v: 0 }, { k: "10", v: 0 }, { k: "11", v: 0 }, { k: "12", v: 0 }
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
                    total: { $arrayElemAt: ["$salesData.total", 0] }
                }
            },
            {
                $replaceRoot: { newRoot: { $mergeObjects: ["$mergedData", { total: "$total" }] } }
            }
        ]);

        var data;

        if (JSON.stringify(orders[0]) == "{}") {
            data = {
                "1": 0,
                "2": 0,
                "3": 0,
                "4": 0,
                "5": 0,
                "6": 0,
                "7": 0,
                "8": 0,
                "9": 0,
                "10": 0,
                "11": 0,
                "12": 0,
                "total": 0
            };
        } else {
            data = orders[0]
        }

        return { status: 200, message: "Thành công !", data: data }
    } catch (error) {
        console.log(error);
        throw error;
    }
}