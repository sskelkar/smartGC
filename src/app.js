import express from 'express';
import {getPickUpRequests, savePickUpRequest} from './pickup/request/gcrequest.controller';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import PropertiesReader from 'properties-reader';
import {getShifts} from "./pickup/schedule/shift.controller";

const app = express();
const port = 4000;
const garbagePickupUrl = '/pickup/requests';
const shiftsUrl = '/pickup/shifts';
const properties = PropertiesReader('properties.ini');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.get(garbagePickupUrl + "/today", getPickUpRequests);
app.post(garbagePickupUrl, savePickUpRequest);
app.get(shiftsUrl, getShifts);

app.listen(port, () => {
    console.log('Server running on port number ' + port);
});

const dbURL = properties.get('dev.mongodb.url');
mongoose.connect(dbURL, { useNewUrlParser: true });
mongoose.Promise = global.Promise;
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

