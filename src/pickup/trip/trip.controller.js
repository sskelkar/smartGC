import Trip from './trip.model';
import {getPickUpRequests} from "../request/pickuprequest.controller";
import PickupRequest from "../request/pickuprequest.model";

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
    let callback = (err, trip) => {
        if (err || trip == null || trip.pickups.length === 0) {
            return res.status(404).send({message: 'No active trip found'});
        }
        let pickupsTillThisResident = trip.pickups.slice(0, 1 + trip.pickups.findIndex(pickup => pickup.residentId === residentId));
        pickupsTillThisResident = pickupsTillThisResident.filter(pickup => pickup.status !== 'DONE');
        res.send({...trip._doc, id: trip._id, pickups: pickupsTillThisResident});
    };
    return getActiveTripQueryForResident(residentId, callback);
};

function getActiveTripQueryForResident(residentId, callback) {
    return Trip.findOne({
        status: 'ACTIVE',
        'pickups.residentId': residentId,
        'pickups.status': 'STARTED'
    }, callback);
}

export const getCollectorLocationFromTrip = async (req, res) => {
    let residentId = req.params.residentId;
    let trip;
    try {
        trip = await getActiveTripQueryForResident(residentId);
        res.send(trip.collectorLocation)
    } catch(e) {
        res.status(404).send({message: 'No active trip found'});
    }
};

export const createTrip = async (req, res) => {
    let pickups = [];
    try {
        pickups = await getPickUpRequests(req.body.date, req.body.shift, req.body.localities);
        pickups.forEach(async pickup => {
            await PickupRequest.updateOne({_id: pickup._id}, {status: 'STARTED'});
        });
    } catch (e) {
        return res.status(400).send(e);
    }
    pickups.forEach(pickup => {
        pickup.status = 'STARTED';
    });
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

export const deleteTrip = (req, res) => {
    let idToDelete = req.params.id;
    return Trip.updateOne(
        {_id: idToDelete, status: 'ACTIVE'},
        {status: 'COMPLETED'},
        async (err, updateResult) => {
            if (err || updateResult.n === 0) {
                return res.status(404).send({message: 'Could not process request'});
            }
            return res.send({message: 'Trip over'});
        }
    );
};