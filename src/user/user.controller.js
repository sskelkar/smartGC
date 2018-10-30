import User from "./user.model";
import PickupRequest from "../pickup/request/pickuprequest.model";
import Trip from "../pickup/trip/trip.model";

export const createUser = (req, res) => {
    let user = new User({
        name: req.body.name,
        phone: req.body.phone,
        role: req.body.role
    });

    user.save((err) => {
        if (err) {
            return res.status(400).send(err);
        }
        res.send(user);
    });
};

async function updatePickupRequestsFor(residentId) {
    await PickupRequest.updateOne(
        {residentId: residentId, status: "STARTED"},
        {status: "DONE"}
    );
}

async function updateTripsThatHaveThisResident(residentId) {
    let trip = await Trip.findOne({
        status: 'ACTIVE',
        'pickups.residentId': residentId,
        'pickups.status': 'STARTED'
    });
    let pickups = trip.pickups;
    let indexToUpdate = pickups.findIndex(pickup => pickup.residentId === residentId);
    pickups[indexToUpdate] = {...pickups[indexToUpdate]._doc, status: "DONE"};
    await Trip.updateOne({_id: trip._id}, {pickups: pickups});
}

export const addKarmaPoints = (req, res) => {
    const id = req.params.id;
    const karma = req.body.karma;

    User.findOne({_id: id, role: 'RESIDENT'}, async (err, user) => {
        if (err || user == null) {
            return res.status(400).send({message: 'Resident not found'});
        }

        await updatePickupRequestsFor(id);
        await updateTripsThatHaveThisResident(id);

        user.set({karmaPoints: user.karmaPoints + karma});
        user.save((err, updatedUser) => {
            if (err) {
                return res.status(500).send('Could not update user ', id);
            }
            res.send(updatedUser);
        });
    });
};

export const getUser = (req, res) => {
    const id = req.params.id;

    User.findOne({_id: id}, (err, user) => {
        if (err || user == null) {
            return res.status(404).send({message: 'User not found'});
        }
        res.send(user);
    });
};