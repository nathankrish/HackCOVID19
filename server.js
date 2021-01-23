import express from 'express';
import join from 'path';
import * as bodyParser from "body-parser";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use('/assets/', express.static('assets'));

app.get('/', (req, res) => {
    res.render("pages/home.ejs");
});

app.get('/submitDocument', (req, res) => {
    res.render("pages/submitDocument.ejs");
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
});