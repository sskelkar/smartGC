import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import PropertiesReader from 'properties-reader';
import {getPickUpRequests, savePickUpRequest} from './pickup/request/pickuprequest.controller';
import {getShifts} from "./pickup/schedule/shift.controller";
import {addKarmaPoints, createUser} from "./user/user.controller";
import {getActiveTripForCollector, getActiveTripForResident} from "./pickup/trip/trip.controller";

export const app = express();
const port = 4000;
const properties = PropertiesReader('properties.ini');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.post('/pickup/requests', savePickUpRequest);
app.get('/pickup/shifts', getShifts);
app.get('/collector/:collectorId/trip', getActiveTripForCollector);
app.get('/resident/:residentId/trip', getActiveTripForResident);
app.post('/users', createUser);
app.put('/users/:id', addKarmaPoints);
// getPickUpRequests('2018-01-02', 'MORNING', ['Kharadi', 'Wagholi']);
app.listen(port, () => {
    console.log('Server running on port number ' + port);
});

const dbURL = properties.get('dev.mongodb.url');
mongoose.connect(dbURL, { useNewUrlParser: true });
mongoose.Promise = global.Promise;
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

