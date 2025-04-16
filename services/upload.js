var multer = require("multer");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/images");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});

const checkfile = (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|png|jpeg|webp|gif)$/)) {
        return cb(new Error("Bạn chỉ được upload file ảnh"));
    }
    return cb(null, true);
};

const upload = multer({ storage: storage, fileFilter: checkfile });

module.exports = {
    upload
};