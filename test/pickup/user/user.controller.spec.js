import {expect} from 'chai';
import request from 'supertest';
import {app} from '../../../src/app';
import User from '../../../src/user/user.model';

describe('User tests', () => {
    const user = {
        "name": "test",
        "role": "COLLECTOR",
        "phone": "9087"
    };
    beforeEach(async () => {
        await User.deleteMany({});
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

    it('should add karma points to a resident', async () => {
        //given
        const createdUser = await User.create({...user, karmaPoints: 100, role: 'RESIDENT'});

        //when
        await request(app)
            .put(`/users/${createdUser._id}`)
            .send({karma: 300})
            .set('Accept', 'application/json')
            .expect(200);

        //then
        const updatedUser = await User.findById(createdUser._id);
        expect(updatedUser.karmaPoints).to.equal(400);
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
});
