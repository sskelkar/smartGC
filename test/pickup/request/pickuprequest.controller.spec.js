import {expect} from 'chai'
import request from 'supertest'
import {app} from '../../../src/app'
import PickupRequest from "../../../src/pickup/request/pickuprequest.model";
import {getPickUpRequests} from "../../../src/pickup/request/pickuprequest.controller";

describe('Pickup request tests', () => {
    let pickupRequest = {
        "residentId": "abc",
        "latitude": 100,
        "longitude": 10,
        "locality": "Wagholi",
        "date": "2018-01-02",
        "shift": "MORNING",
        "status": "PLANNED"
    };
    beforeEach(async () => {
        await PickupRequest.deleteMany({});
    });
    it('should add a pick up request', async () => {
        //when
        let resp = await request(app)
            .post('/pickup/requests')
            .send(pickupRequest)
            .set('Accept', 'application/json')
            .expect(200);

        //then
        expect(resp.body).to.eql({message: 'Your pickup request was successful'})
        let savedRequests = await PickupRequest.find();
        expect(savedRequests.length).to.equal(1);
        expect(savedRequests[0]._id).to.exist;
        expect(savedRequests[0].status).to.equal('PLANNED');
    });

    it('should return pickup requests for given input', async () => {
        //given
        let expected1 = await PickupRequest.create({...pickupRequest});
        let expected2 = await PickupRequest.create({...pickupRequest, locality: 'Kharadi'});
        await PickupRequest.create({...pickupRequest, locality: 'Kharadi', status: "STARTED"});
        await PickupRequest.create({...pickupRequest, date: '2018-01-30'});
        await PickupRequest.create({...pickupRequest, shift: 'EVENING'});
        await PickupRequest.create({...pickupRequest, locality: 'Baner'});

        //when
        let pickUpRequests = await getPickUpRequests(pickupRequest.date, pickupRequest.shift, ['Kharadi', 'Wagholi']);

        //then
        expect(pickUpRequests.length).to.equal(2);
        verify(expected1, pickUpRequests[0]);
        verify(expected2, pickUpRequests[1]);
    });

    function verify(expected, actual) {
        expect(actual.latitude).to.equal(expected.latitude);
        expect(actual.longitude).to.equal(expected.longitude);
        expect(actual.locality).to.equal(expected.locality);
        expect(actual.shift).to.equal(expected.shift);
        expect(actual.date).to.eql(new Date(expected.date));
        expect(actual.residentId).to.equal(expected.residentId);
        expect(actual.status).to.equal(expected.status);
    }
});