import express from 'express';
import GCRequest from './gcrequest.model';
const router = express.Router();

//db.gcrequests.aggregate([{$project:{year: {$year: "$pickUpTime"}}},{$match:{year:{$gte:2018}}}])
router.get('/pickup/today', (req, res, next) => {
    GCRequest.aggregate()
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
});

router.post('/pickup', (req, res, next) => {
    let gcrequest = new GCRequest({
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        pickUpTime: req.body.pickUpTime
    });
    
    gcrequest.save((err) => {
        if (err) {
            return next(err);
        }
        res.send('Product Created successfully');
    });

});

export default router;