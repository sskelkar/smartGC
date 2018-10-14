import express from 'express';
import PickUpRouter from './garbagecollection/gcrequest.route';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';

const app = express();
const port = 4000;
const rootPath = '/garbage';
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.listen(port, () => {
    console.log('Server running on port number ' + port);
});

app.use(rootPath, PickUpRouter);

let dbURL = 'mongodb://127.0.0.1:27017/garbagecollection';
mongoose.connect(dbURL, { useNewUrlParser: true });
mongoose.Promise = global.Promise;
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

