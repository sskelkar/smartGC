import { expect } from 'chai';
import request from 'request';

xit('Main page', (done) => {
    request('http://localhost:4000', (error, res, body) => {
        expect(body).to.equal("Hello");
        done();
    });
});
