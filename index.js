const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const fs = require("fs-extra");
const MongoClient = require("mongodb").MongoClient;
const ObjectID = require("mongodb").ObjectID;
require("dotenv").config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.n4eji.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const port = process.env.PORT || 5000;

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use(fileUpload());

app.get("/", (req, res) => {
  res.send("Hello World! Nouka Baich Is Running");
});

client.connect((err) => {
  const boatsCollection = client.db("noukaBaich").collection("boats");
  const reviewsCollection = client.db("noukaBaich").collection("reviews");
  const adminsCollection = client.db("noukaBaich").collection("admins");
  const bookingsCollection = client.db("noukaBaich").collection("bookings");
  console.log(err);

  app.post("/check-admin", (req, res) => {
    const email = req.body.email;
    adminsCollection.find({ email }).toArray((err, doc) => {
      res.send(doc.length > 0);
    });
  });

  app.post("/add-admin", (req, res) => {
    const admin = req.body;
    adminsCollection.insertOne(admin).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.post("/add-boat", (req, res) => {
    const imgFile = req.files.boatImg;
    const imgData = imgFile.data;
    const encImg = imgData.toString("base64");
    const boatImg = {
      type: imgFile.mimetype,
      size: imgFile.size,
      img: Buffer.from(encImg, "base64"),
    };
    const boatInfo = req.body;

    boatsCollection.insertOne({ ...boatInfo, boatImg }).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/boats", (req, res) => {
    boatsCollection.find({}).toArray((err, doc) => {
      res.send(doc);
    });
  });

  app.get("/boatByName/:boat", (req, res) => {
    const boat = req.params.boat;
    boatsCollection.find({ boatName: boat }).toArray((err, doc) => {
      res.send(doc);
    });
  });

  app.delete("/delete-boat", (req, res) => {
    const id = req.query.id;
    boatsCollection.deleteOne({ _id: ObjectID(id) }).then((result) => {
      res.send(result.deletedCount > 0);
    });
  });

  app.post("/add-review", (req, res) => {
    const review = req.body;
    reviewsCollection.insertOne(review).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/reviews", (req, res) => {
    reviewsCollection.find({}).toArray((err, doc) => {
      res.send(doc);
    });
  });

  app.post("/review-by-user", (req, res) => {
    const email = req.body.email;
    reviewsCollection.find({ email: email }).toArray((err, doc) => {
      res.send(doc.length > 0);
    });
  });

  app.post("/add-booking", (req, res) => {
    const booking = req.body;
    bookingsCollection.insertOne(booking).then((result) => {
      // res.send(result.insertedCount > 0);
      res.send(result);
    });
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
