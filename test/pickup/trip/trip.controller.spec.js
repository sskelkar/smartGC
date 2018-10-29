import {expect} from 'chai'
import request from 'supertest'
import {app} from '../../../src/app'
import Trip from "../../../src/pickup/trip/trip.model";
import PickupRequest from "../../../src/pickup/request/pickuprequest.model";

describe('Trip tests', () => {
    const collectorId = "50";
    const residentId = "100";
    let pickupRequest = {
        residentId,
        "latitude": 100,
        "longitude": 10,
        "locality": "Wagholi",
        "date": "2018-01-02",
        "shift": "MORNING",
        "status": "STARTED"
    };
    beforeEach(async () => {
        await Trip.deleteMany({});
        await PickupRequest.deleteMany({});
    });

    it('should return active trip for a collector', async () => {
        //given
        let expectedTrip = await Trip.create({collectorId, status: 'ACTIVE', pickups: [pickupRequest]});
        await Trip.create({collectorId, status: 'COMPLETED', pickups: [pickupRequest]});
        await Trip.create({collectorId: "2", status: 'ACTIVE', pickups: [pickupRequest]});

        //when
        let trip = await request(app)
            .get(`/trips/collector/${collectorId}`)
            .set('Accept', 'application/json')
            .expect(200);

        //then
        verifyTrip(expectedTrip, trip.body);
    });

    it('should return 404 if no active trip is found for a collector', async () => {
        //given
        await Trip.create({collectorId, status: 'COMPLETED', pickups: [pickupRequest]});
        await Trip.create({collectorId: "2", status: 'ACTIVE', pickups: [pickupRequest]});

        //when
        await request(app)
            .get(`/trips/collector/${collectorId}`)
            .set('Accept', 'application/json')
            .expect(404, {message: 'No active trip found'});
    });

    it('should return 404 if no trip with at least one pickup point is found for a collector', async () => {
        //given
        await Trip.create({collectorId, status: 'ACTIVE', pickups: []});
        await Trip.create({collectorId: "2", status: 'ACTIVE', pickups: [pickupRequest]});

        //when
        await request(app)
            .get(`/trips/collector/${collectorId}`)
            .set('Accept', 'application/json')
            .expect(404, {message: 'No active trip found'});
    });

    it('should return active trip for a resident with pickup points only till requested resident', async () => {
        //given
        await Trip.create({collectorId, status: 'ACTIVE', pickups: [{...pickupRequest, residentId: "99"}]});
        await Trip.create({collectorId, status: 'COMPLETED', pickups: [pickupRequest]});
        let tripWithRequestedResident = await Trip.create({
            collectorId,
            status: 'ACTIVE',
            pickups: [
                {...pickupRequest, residentId: "98"},
                {...pickupRequest, residentId: "99"},
                {...pickupRequest, residentId: "100"},
                {...pickupRequest, residentId: "101"},
                {...pickupRequest, residentId: "102"}
            ]
        });

        //when
        let trip = await request(app)
            .get(`/trips/resident/${residentId}`)
            .set('Accept', 'application/json')
            .expect(200);

        //then
        const expectedTrip = {
            ...tripWithRequestedResident._doc,
            pickups: [
                {...pickupRequest, residentId: "98"},
                {...pickupRequest, residentId: "99"},
                {...pickupRequest, residentId: "100"}
            ]
        };
        verifyTrip(expectedTrip, trip.body);
    });

    it('should return 404 if no active trip found with a pickup for a given resident', async () => {
        //given
        await Trip.create({collectorId, status: 'ACTIVE', pickups: [{...pickupRequest, residentId: "99"}]});
        await Trip.create({collectorId, status: 'COMPLETED', pickups: [pickupRequest]});

        //when
        await request(app)
            .get(`/trips/resident/${residentId}`)
            .set('Accept', 'application/json')
            .expect(404, {message: 'No active trip found'});
    });

    it('should return 404 if active trip found for a given resident, but pickup is already done for him/her', async () => {
        //given
        await Trip.create({collectorId, status: 'ACTIVE', pickups: [{...pickupRequest, residentId: "99"}]});
        await Trip.create({collectorId, status: 'ACTIVE', pickups: [{...pickupRequest, status: "DONE"}]});

        //when
        await request(app)
            .get(`/trips/resident/${residentId}`)
            .set('Accept', 'application/json')
            .expect(404, {message: 'No active trip found'});
    });

    it('should create a trip for a given collector and requests found for a schedule', async () => {
        //given
        const collectorId = "1";
        let pickup1 = {...pickupRequest, residentId: "10"};
        let pickup2 = {...pickupRequest, residentId: "20"};
        let pickup3 = {...pickupRequest, residentId: "30"};
        await PickupRequest.create(pickup1);
        await PickupRequest.create(pickup2);
        await PickupRequest.create(pickup3);
        await PickupRequest.create({...pickupRequest, residentId: "40", shift: 'EVENING'});

        //when
        await request(app)
            .post(`/trips`)
            .send({
                collectorId,
                shift: pickupRequest.shift,
                localities: [pickupRequest.locality],
                date: pickupRequest.date
            })
            .set('Accept', 'application/json')
            .expect(200);

        //then
        let savedTrips = await Trip.find();
        let expectedTrip = {collectorId, status: 'ACTIVE', pickups: [pickup1, pickup2, pickup3]};
        verifyTrip(expectedTrip, savedTrips[0]);
    });

    it('should update a trip with collector location or pickup request order', async () => {
        //given
        let trip = await Trip.create({collectorId, status: 'ACTIVE', pickups: [pickupRequest]});
        await Trip.create({collectorId, status: 'COMPLETED', pickups: [pickupRequest]});
        await Trip.create({collectorId: "2", status: 'ACTIVE', pickups: [pickupRequest]});

        //when
        let updatedTripRequest = {...trip._doc, collectorLocation: {latitude: 10, longitude: 10}};
        await request(app)
            .put(`/trips/${trip._id}`)
            .send(updatedTripRequest)
            .set('Accept', 'application/json')
            .expect(200);

        //then
        verifyTrip(updatedTripRequest, await Trip.findById(trip._id));
    });

    it('should throw 404 if no active trip found to update', async () => {
        //given
        let trip = await Trip.create({collectorId, status: 'COMPLETED', pickups: [pickupRequest]});

        //when
        let updatedTripRequest = {...trip._doc, collectorLocation: {latitude: 10, longitude: 10}};
        await request(app)
            .put(`/trips/${trip._id}`)
            .send(updatedTripRequest)
            .set('Accept', 'application/json')
            .expect(404, {message: 'Could not process request'});
    });

    function verifyTrip(expected, actual) {
        expect(actual.id).to.exist;
        expect(actual.collectorId).to.equal(expected.collectorId);
        expect(actual.status).to.equal(expected.status);
        expect(actual.pickups.length).to.equal(expected.pickups.length);

        for(let i=0; i<expected.pickups.length; i++) {
            verifyPickup(expected.pickups[i], actual.pickups[i])
        }
    }

    function verifyPickup(expected, actual) {
        expect(actual.latitude).to.equal(expected.latitude);
        expect(actual.longitude).to.equal(expected.longitude);
        expect(actual.locality).to.equal(expected.locality);
        expect(actual.shift).to.equal(expected.shift);
        expect(new Date(actual.date)).to.eql(new Date(expected.date));
        expect(actual.residentId).to.equal(expected.residentId);
    }
});