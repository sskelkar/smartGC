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
        "shift": "MORNING"
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
        expect(resp.text).to.equal('Garbage pickup request is successful')
        expect(await PickupRequest.estimatedDocumentCount()).to.equal(1);
    });

    it('should return pickup requests for given input', async () => {
        //given
        await PickupRequest.create({...pickupRequest});
        await PickupRequest.create({...pickupRequest, locality: 'Kharadi'});
        await PickupRequest.create({...pickupRequest, date: '2018-01-30'});
        await PickupRequest.create({...pickupRequest, shift: 'EVENING'});
        await PickupRequest.create({...pickupRequest, locality: 'Baner'});

        //when
        let pickUpRequests = await getPickUpRequests(pickupRequest.date, pickupRequest.shift, ['Kharadi', 'Wagholi']);

        //then
        verify(pickupRequest, pickUpRequests[0]);
        verify({...pickupRequest, locality: 'Kharadi'}, pickUpRequests[1]);
    });

    function verify(expected, actual) {
        expect(actual.latitude).to.equal(expected.latitude);
        expect(actual.longitude).to.equal(expected.longitude);
        expect(actual.locality).to.equal(expected.locality);
        expect(actual.shift).to.equal(expected.shift);
        expect(actual.date).to.eql(new Date(expected.date));
        expect(actual.residentId).to.equal(expected.residentId);
    }
});