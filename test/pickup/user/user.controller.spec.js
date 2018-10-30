import {expect} from 'chai';
import request from 'supertest';
import {app} from '../../../src/app';
import User from '../../../src/user/user.model';
import PickupRequest from "../../../src/pickup/request/pickuprequest.model";
import Trip from "../../../src/pickup/trip/trip.model";

describe('User tests', () => {
    const user = {
        "name": "test",
        "role": "COLLECTOR",
        "phone": "9087"
    };
    beforeEach(async () => {
        await User.deleteMany({});
        await PickupRequest.deleteMany({});
        await Trip.deleteMany({});
    });
    it('should create user', () => {
        request(app)
            .post('/users')
            .send(user)
            .set('Accept', 'application/json')
            .expect(200, (err, res) => {
                expect(res.body.name).to.equal(user.name);
                expect(res.body.role).to.equal(user.role);
                expect(res.body.phone).to.equal(user.phone);
                expect(res.body.karmaPoints).to.equal(0);
                expect(res.body.id).to.exist;
            })
    });

    it('should add karma points to a resident and set its pickup request to done', async () => {
        //given
        const createdUser = await User.create({...user, karmaPoints: 100, role: 'RESIDENT'});
        let pickupRequestJson = {
            "residentId": createdUser._id,
            "latitude": 100,
            "longitude": 10,
            "locality": "Wagholi",
            "date": "2018-01-02",
            "shift": "MORNING",
            "status": "STARTED"
        };
        let pickupStarted = await PickupRequest.create(pickupRequestJson);
        let pickupPlanned = await PickupRequest.create({...pickupRequestJson, status: "PLANNED"});
        let trip = await Trip.create({
            collectorId: "1",
            status: 'ACTIVE',
            pickups: [pickupRequestJson, {...pickupRequestJson, residentId: "99"}]
        });

        //when
        await request(app)
            .put(`/users/${createdUser._id}`)
            .send({karma: 300})
            .set('Accept', 'application/json')
            .expect(200);

        //then
        const updatedUser = await User.findById(createdUser._id);
        expect(updatedUser.karmaPoints).to.equal(400);

        let updatedPickup = await PickupRequest.findById(pickupStarted._id);
        let notUpdatedPickup = await PickupRequest.findById(pickupPlanned._id);
        expect(updatedPickup.status).to.equal('DONE');
        expect(notUpdatedPickup.status).to.equal('PLANNED');

        let updatedTrip = await Trip.findById(trip._id);
        expect(updatedTrip.pickups[0].status).to.equal('DONE');
    });

    it('should throw 400 if user is not a resident', async () => {
        //given
        const createdUser = await User.create({...user, karmaPoints: 100});

        //when
        await request(app)
            .put(`/users/${createdUser._id}`)
            .send({karma: 300})
            .set('Accept', 'application/json')
            .expect(400, {message: 'Resident not found'});
    });

    it('should return user', async () => {
        //given
        const createdUser = await User.create({...user, karmaPoints: 100, role: 'RESIDENT'});

        //when
        let response = await request(app)
            .get(`/users/${createdUser._id}`)
            .set('Accept', 'application/json')
            .expect(200);

        //then
        verify(createdUser, response.body);
    });

    it('should return 404 if user not found', async () => {
        //when
        await request(app)
            .get(`/users/1`)
            .set('Accept', 'application/json')
            .expect(404, {message: 'User not found'});
    });

    function verify(expected, actual) {
        expect(actual.name).to.equal(expected.name);
        expect(actual.phone).to.equal(expected.phone);
        expect(actual.role).to.equal(expected.role);
        expect(actual.karmaPoints).to.equal(expected.karmaPoints);
        expect(actual.id).to.equal(expected.id);
    }
});
