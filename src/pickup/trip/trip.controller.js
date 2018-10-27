import Trip from './trip.model';

export const getActiveTripForCollector = (req, res) => {
    let collectorId = req.params.collectorId;
    return Trip.findOne({
        collectorId,
        status: 'ACTIVE',
    }, (err, trip) => {
        if (err || trip == null || trip.pickups.length === 0) {
            return res.status(404).send('No active found for collector: ' + collectorId);
        }
        return res.send(trip);
    });
};

export const getActiveTripForResident = (req, res) => {
    let residentId = req.params.residentId;
    return Trip.findOne({
        status: 'ACTIVE',
        'pickups.residentId': residentId
    }, (err, trip) => {
        if (err || trip == null || trip.pickups.length === 0) {
            return res.status(404).send('No active found for resident: ' + residentId);
        }
        return res.send(trip);
    });
};