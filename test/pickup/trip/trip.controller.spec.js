import {expect} from 'chai'
import request from 'supertest'
import {app} from '../../../src/app'
import Trip from "../../../src/pickup/trip/trip.model";

describe('Pickup trip tests', () => {
    let pickupRequest = {
        "residentId": "abc",
        "latitude": 100,
        "longitude": 10,
        "locality": "Wagholi",
        "date": "2018-01-02",
        "shift": "MORNING"
    };
    beforeEach(async () => {
        await Trip.deleteMany({});
    });

    it('should return active trip for a collector', async () => {
        //given
        const collectorId = "1";
        let expectedTrip = await Trip.create({collectorId, status: 'ACTIVE', pickups: [pickupRequest]});
        await Trip.create({collectorId, status: 'COMPLETED', pickups: [pickupRequest]});
        await Trip.create({collectorId: "2", status: 'ACTIVE', pickups: [pickupRequest]});

        //when
        let trip = await request(app)
            .get(`/pickup/trips/${collectorId}`)
            .set('Accept', 'application/json')
            .expect(200);

        //then
        verify(expectedTrip, trip.body);
    });

    it('should return 404 if no active trip is found for a collector', async () => {
        //given
        const collectorId = "1";
        await Trip.create({collectorId, status: 'COMPLETED', pickups: [pickupRequest]});
        await Trip.create({collectorId: "2", status: 'ACTIVE', pickups: [pickupRequest]});

        //when
        await request(app)
            .get(`/pickup/trips/${collectorId}`)
            .set('Accept', 'application/json')
            .expect(404, `No active found for collector: ${collectorId}`);
    });

    it('should return 404 if no trip with at least one pickup point is found for a collector', async () => {
        //given
        const collectorId = "1";
        await Trip.create({collectorId, status: 'ACTIVE', pickups: []});
        await Trip.create({collectorId: "2", status: 'ACTIVE', pickups: [pickupRequest]});

        //when
        await request(app)
            .get(`/pickup/trips/${collectorId}`)
            .set('Accept', 'application/json')
            .expect(404, `No active found for collector: ${collectorId}`);
    });

    function verify(expected, actual) {
        expect(actual.collectorId).to.equal(expected.collectorId);
        expect(actual.status).to.equal(expected.status);
    }
});