var express = require("express");
var router = express.Router();

const { upload } = require('../services/upload')

router.post("/image", upload.single("image"), async function (req, res, next) {
    try {
        if (!req.file) return res.status(400).json({ status: 400, message: "Không tìm thấy file ảnh !" });
        return res.status(200).json({ status: 200, message: "Success" });
    } catch (error) {
        return res.status(500).json({ status: 500, message: "Internal Server Error" });
    }
});

router.post("/images", upload.array("images"), async function (req, res, next) {
    try {
        if (!req.files || !req.files.length) return res.status(400).json({ status: 400, message: "Không tìm thấy file ảnh !" });
        return res.status(200).json({ status: 200, message: "Success" });
    } catch (error) {
        return res.status(500).json({ status: 500, message: "Internal Server Error" });
    }
});

module.exports = router;
