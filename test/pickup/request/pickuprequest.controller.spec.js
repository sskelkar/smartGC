import {expect} from 'chai'
import request from 'supertest'
import {app} from '../../../src/app'
import PickupRequest from "../../../src/pickup/request/pickuprequest.model";
import {getPickUpRequests} from "../../../src/pickup/request/pickuprequest.controller";

describe('Pickup request tests', () => {
    let pickupRequest = {
        "latitude": 100,
        "longitude": 10,
        "locality": "Wagholi",
        "date": "2018-01-02",
        "shift": "MORNING"
    };
    beforeEach(async () => {
       await PickupRequest.remove({});
    });
    it('should add a pick up request', async () => {
        let resp = await request(app)
            .post('/pickup/requests')
            .send(pickupRequest)
            .set('Accept', 'application/json')
            .expect(200);
        expect(resp.text).to.equal('Garbage pickup request is successful')
    });

    it.only('should return pickup requests for given input', async () => {
        //given
        await PickupRequest.create({...pickupRequest});
        await PickupRequest.create({...pickupRequest, locality: 'Kharadi'});
        await PickupRequest.create({...pickupRequest, date: '2018-01-30'});
        await PickupRequest.create({...pickupRequest, shift: 'EVENING'});
        await PickupRequest.create({...pickupRequest, locality: 'Baner'});

        //when
        let pickUpRequests = await getPickUpRequests(pickupRequest.date, pickupRequest.shift, ['Kharadi', 'Wagholi']);

        //then
        expect(pickUpRequests).to.eql([pickupRequest, {...pickupRequest, locality: 'Kharadi'}]);
    });
});