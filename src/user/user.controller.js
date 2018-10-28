import User from "./user.model";

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

export const addKarmaPoints = (req, res) => {
    const id = req.params.id;
    const karma = req.body.karma;

    User.findOne({_id: id, role: 'RESIDENT'}, (err, user) => {
        if (err || user == null) {
            return res.status(400).send({message: 'Resident not found'});
        }

        user.set({ karmaPoints: user.karmaPoints + karma });
        user.save((err, updatedUser) => {
            if (err) {
                return res.status(500).send('Could not update user ', id);
            }
            res.send(updatedUser);
        });
    });
};