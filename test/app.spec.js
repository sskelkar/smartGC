import expect from 'chai';
import request from 'supertest';
import {app} from '../src/app';

xit('Main page', (done) => {
    request(app)
        .get('/hello')
        .expect(200, 'Hello world', done)
});
