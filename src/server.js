import express from 'express';
import * as path from 'path';
import * as bodyParser from "body-parser";
import * as multer from "multer";
import sanitize from "sanitize-filename";
import mongoose from "mongoose";
import {testInfo} from "./testInfo.js"
import {user} from "./user.js"

const app = express();
const port = process.env.PORT || 80;

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
            reviewedByHR: false,
            approvedByHR: false
        });
        newTest.save();
        res.redirect('/')
    });
});

app.get('/reviewDocs', (req, res) => {
    testInfo.find({reviewedByHR: false}).then((docs) => {
        res.render('pages/reviewDocs.ejs', {docs: docs});
    }).catch((err) => {
        res.render('pages/reviewDocs.ejs');
    });
});

app.get('/viewDoc', (req, res) => {
    testInfo.findById(req.query.id).then((doc) => {
        console.log(doc.documentationPath);
        res.sendFile(path.join(path.resolve(), doc.documentationPath));
    }).catch();
});

app.get('/approveDoc', async (req, res) => {
    let info = await testInfo.findById(req.query.id);
    info.reviewedByHR = true;
    info.approvedByHR = true;
    await info.save();
    res.redirect('/reviewDocs');
});

app.get('/rejectDoc', async (req, res) => {
    let info = await testInfo.findById(req.query.id);
    info.reviewedByHR = true;
    info.approvedByHR = false;
    await info.save();
    res.redirect('/reviewDocs');
});

app.get('/statistics', async (req, res) => {
    let numPositive = await testInfo.countDocuments({testResult: true});
    let numNegative = await testInfo.countDocuments({testResult: false});

    let positivityRate = (numPositive * 1.0 / await testInfo.countDocuments()) * 100.0;

    let numTestedLastWeek = await testInfo.find({testDate: {$gte: new Date(new Date() - 7 * 60 * 60 * 24 * 1000)}}).countDocuments();
    res.render('pages/dashboard.ejs', {numPositive, numNegative, positivityRate, numTestedLastWeek});
})