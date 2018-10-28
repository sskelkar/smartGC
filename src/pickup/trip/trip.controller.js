import Trip from './trip.model';
import {getPickUpRequests} from "../request/pickuprequest.controller";

export const getActiveTripForCollector = (req, res) => {
    let collectorId = req.params.collectorId;
    return Trip.findOne({
        collectorId,
        status: 'ACTIVE',
    }, (err, trip) => {
        if (err || trip == null || trip.pickups.length === 0) {
            return res.status(404).send({message: 'No active trip found'});
        }
        return res.send(trip);
    });
};

export const getActiveTripForResident = (req, res) => {
    let residentId = req.params.residentId;
    return Trip.findOne({
        status: 'ACTIVE',
        'pickups.residentId': residentId,
        'pickups.status': 'PICKUP_PLANNED'
    }, (err, trip) => {
        if (err || trip == null || trip.pickups.length === 0) {
            return res.status(404).send({message: 'No active trip found'});
        }
        return res.send(trip);
    });
};

export const createTrip = async (req, res) => {
    let pickups = [];
    try {
        pickups = await getPickUpRequests(req.body.date, req.body.shift, req.body.localities);
    } catch (e) {
        return res.status(400).send(e);
    }

    let trip = new Trip({
        collectorId: req.body.collectorId,
        pickups,
        status: 'ACTIVE'
    });

    trip.save(err => {
        if (err) {
            return res.status(400).send(err);
        }
        res.status(200).send();
    })
};

export const updateTrip = (req, res) => {
    let idToUpdate = req.params.id;
    return Trip.updateOne(
        {_id: idToUpdate, status: 'ACTIVE'},
        req.body,
        async (err, updateResult) => {
            if (err || updateResult.n === 0) {
                return res.status(404).send({message: 'Could not process request'});
            }
            return res.send(await Trip.findById(idToUpdate));
        }
    );
};