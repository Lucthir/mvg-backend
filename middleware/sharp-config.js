const sharp = require("sharp");
const fs = require("fs");

module.exports = async (req, res, next) => {
  const image = req.file;
  console.log(image);
  const newName = image.filename.replace(".jpg", ".webp");
  //   console.log(newName);
  await sharp(req.file.path)
    .toFormat("webp")
    .webp({ quality: 20 })
    .toFile(`${req.file.destination}/${newName}.webp`)
    .then((info) => {
      req.file.filename = newName;
      req.file.path = `images\\${newName}`;
      req.file.mimetype = "image/webp";
      console.log(req.file);
    })
    .catch((err) => {
      alert(err);
    });
  //   fs.unlinkSync(req.file.path);

  next();
  //   return res.send("SUCCESS!");
};
