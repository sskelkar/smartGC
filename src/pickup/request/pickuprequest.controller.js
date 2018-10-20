import PickupRequest from './pickuprequest.model';

//db.gcrequests.aggregate([{$project:{year: {$year: "$pickUpTime"}}},{$match:{year:{$gte:2018}}}])
export const getPickUpRequests = (req, res, next) => {
    PickupRequest.aggregate()
        .project({
            year: { $year: "$pickUpTime" }
        })
        .match({
            year: { $gte: 2018 }
        }).exec((err, result) => {
            if (err) {
                return next(err);
            }
            res.send(result);
        })
};

export const savePickUpRequest = (req, res, next) => {
    let pickupRequest = new PickupRequest({
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        locality: req.body.locality,
        date: req.body.date,
        shift: req.body.shift
    });
    
    pickupRequest.save((err) => {
        if (err) {
            return next(err);
        }
        res.send('Garbage pickup request is successful');
    });
};