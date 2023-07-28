const multer = require("multer");
const SharpMulter = require("sharp-multer");

// const MIME_TYPES = {
//   "image/jpg": "jpg",
//   "image/jpeg": "jpg",
//   "image/png": "png",
//   "image/webp": "webp",
// };

const newFilenameFunction = (og_filename, options) => {
  const newname =
    og_filename.replace(".jpg", "").replace(".png", "").replace(".webp", "") +
    Date.now() +
    "." +
    options.fileFormat;
  return newname;
};

const storage = SharpMulter({
  destination: (req, file, callback) => {
    callback(null, "images");
  },
  imageOptions: {
    fileFormat: "webp",
    quality: 20,
  },
  mimetype: "image/webp",
  filename: newFilenameFunction,
});

// multer.diskStorage({
// destination: (req, file, callback) => {
//   callback(null, "images");
// },
// filename: (req, file, callback) => {
//   const name = file.originalname.split(" ").join("_").replace(".jpg", "");
//   const extension = MIME_TYPES[file.mimetype];
//   callback(null, name + Date.now() + "." + extension);
// },
// });

module.exports = multer({ storage }).single("image");
