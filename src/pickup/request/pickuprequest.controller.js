import PickupRequest from './pickuprequest.model';

export const getPickUpRequests = (date, shift, localities) => {
     return PickupRequest.aggregate([
        {
            $match: {
                shift,
                locality: {$in: localities},
                date: new Date(date)
            }
        }
    ]).then(result => console.log(result));
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