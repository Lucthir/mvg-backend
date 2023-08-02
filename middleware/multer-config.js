const multer = require("multer");
const SharpMulter = require("sharp-multer");

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

module.exports = multer({ storage }).single("image");
