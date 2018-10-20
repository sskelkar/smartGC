import { expect } from 'chai';
import request from 'supertest';

xit('Main page', (done) => {
    request('/', (error, res, body) => {
        expect(body).to.equal("Hello");
        done();
    });
});
