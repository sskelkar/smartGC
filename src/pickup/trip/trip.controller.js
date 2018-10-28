import Trip from './trip.model';

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