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
  Book.find({ _id: req.params.id })
    .then((thing) => {
      let total = 0;
      thing[0].ratings.forEach((current) => {
        total += current.grade;
      });
      avgGrade = total / thing[0].ratings.length;
      console.log(total);
      console.log(thing[0].ratings.length);
      console.log(avgGrade);
    })
    .catch((error) => console.log(error));

  //   let total = 0;
  //   Book.find({ _id: req.params.id })
  //     .then((thing) => {
  //       console.log(
  //         thing[0].ratings.forEach((current) => {
  //           total += current.grade;
  //         })
  //       );
  //     })
  //     .catch((error) => {
  //       res.status(400).json({ error });
  //     });
  //   console.log(total);

  //   , { "ratings.grade": true }
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
    .then(() => {
      //   res.status(200).json({ message: "Note Attribuée" });
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

          Book.updateOne(
            { _id: req.params.id },
            { $set: { averageRating: avgGrade }, _id: req.params.id }
          )
            .then(() =>
              res.status(200).json({ message: "Average Rating modifié" })
            )
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

  console.log(dataReq);
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

exports.bestRating = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 })
    .limit(3)
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error: error }));
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
