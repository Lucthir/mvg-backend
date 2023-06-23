const Book = require("../models/Book");
const fs = require("fs");

exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });

  book
    .save()
    .then(() => {
      res.status(201).json({ message: "Objet Enregistré" });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.modifyBook = (req, res, next) => {
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageURL: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };
  delete bookObject._userId;
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Non Autorisé" });
      } else {
        Book.updateOne(
          { _id: req.params.id },
          { ...bookObject, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: "Objet Modifié" }))
          .catch((error) => {
            res.status(401).json({ error });
          });
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.testFonction = (req, res, next) => {
  const dataReq = {
    // _id: req.params.id,
    userId: req.body.userId,
    grade: req.body.rating,
  };
  Book.findOneAndUpdate(
    { _id: req.params.id },
    { $push: { ratings: dataReq } },
    { new: true }
  )
    .then((book) => {
      // console.log(book);
      Book.find({ _id: req.params.id })
        .then((book) => {
          let total = 0;
          book[0].ratings.forEach((current) => {
            total += current.grade;
          });
          let avgGrade = total / book[0].ratings.length;
          //   console.log(total);
          //   console.log(thing[0].ratings.length);
          //   console.log(avgGrade);
          // console.log(book[0]);

          Book.updateOne(
            { _id: req.params.id },
            { averageRating: avgGrade },
            { new: true }
          )
            .then((result) => {
              result._id = req.params.id;
              console.log(book[0]);
              console.log(result);

              res.status(200).json(result);
            })
            .catch((error) => {
              res.status(400).json({ error });
            });
        })
        .catch((error) => {
          res.status(400).json({ error });
        });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
  // console.log(dataReq);

  // res.status(200).json({ message: "Note ajoutée" })
};

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Non Autorisé" });
      } else {
        const filename = book.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: "Objet Supprimé" }))
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.rateBook = (req, res, next) => {
  const dataReq = {
    id: req.params.id,
    userId: req.body.userId,
    grade: req.body.rating,
  };
  Book.updateOne(
    { _id: req.params.id },
    { $push: { ratings: dataReq }, _id: req.params.id }
  )
    .then((book) => {
      console.log(book);
      Book.find({ _id: req.params.id })
        .then((thing) => {
          let total = 0;
          thing[0].ratings.forEach((current) => {
            total += current.grade;
          });
          let avgGrade = total / thing[0].ratings.length;
          //   console.log(total);
          //   console.log(thing[0].ratings.length);
          //   console.log(avgGrade);
          console.log(thing[0]._id);

          Book.updateOne(
            { _id: req.params.id },
            { $set: { averageRating: avgGrade }, _id: req.params.id }
          )
            .then(() => res.status(200).json({ message: "Note ajoutée" }))
            .catch((error) => {
              res.status(400).json({ error });
            });
        })
        .catch((error) => {
          res.status(400).json({ error });
        });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
  // console.log(dataReq);

  // res.status(200).json({ message: "Note ajoutée" })
};

exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(400).json({ error: error }));
};

exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error: error }));
};

exports.bestRating = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 })
    .limit(3)
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error: error }));
};
