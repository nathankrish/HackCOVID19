import express from 'express';
import * as path from 'path';
import * as bodyParser from "body-parser";
import * as multer from "multer";
import sanitize from "sanitize-filename";
import mongoose from "mongoose";
import {testInfo} from "./testInfo.js"

const app = express();
const port = 3000;

// SET STORAGE
const storage = multer.diskStorage({
    destination: 'public/uploads',
    filename: function (req, file, cb) {
      cb(null, sanitize(file.fieldname) + '-' + sanitize(req.body.gtid) + '-' + req.body.testDate + path.extname(file.originalname));
    }
});
   
const uploadDocs = multer.default({
    storage: storage,
    limits: { fileSize: 1000000 }
}).single('covidDoc');

//Set up default mongoose connection
const dbURI = 'mongodb+srv://krish:HACKCOVID19@cluster0.98788.mongodb.net/covidTest?retryWrites=true&w=majority';
mongoose.connect(dbURI, {useNewUrlParser: true, useUnifiedTopology: true})
    .then((res) => {
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`)
        });
    })
    .catch((err) => console.log(err));

//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use('/assets/', express.static('assets'));

app.get('/', (req, res) => {
    res.render("pages/home.ejs");
});

app.get('/submitDocument', (req, res) => {
    res.render("pages/submitDocument.ejs");
});

app.post('/uploadFile', (req, res) => {
    uploadDocs(req, res, (err) => {
        var testResult;
        if (req.body.testResult === "positive") {
            testResult = true;
        } else {
            testResult = false;
        }
        const newTest = new testInfo({
            gtid : req.body.gtid,
            testDate: req.body.testDate,
            testResult: testResult,
            documentationPath: req.file.path,
            approvedByHR: false
        });
        newTest.save();
        res.redirect('/')
    });
});

app.get('/reviewDocs', (req, res) => {
    testInfo.find().then((docs) => {
        res.render('pages/reviewDocs.ejs', {docs: docs});
    }).catch((err) => {
        res.render('pages/reviewDocs.ejs');
    });
});