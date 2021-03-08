require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;

    beforeAll(async done => {
      execSync('npm run setup-db');

      client.connect();

      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });

      token = signInData.body.token; // eslint-disable-line

      return done();
    });

    afterAll(done => {
      return client.end(done);
    });

    //Test post
    test('It should create a new task', async () => {

      const newTask = {
        id: 2,
        todo: 'Trash',
        completed: false,
        user_id: 2
      };

      const data = await fakeRequest(app)
        .post('/api/todos')
        .send(newTask)
        .set('Authorization', token);
      // .expect('Content-Type', /json/)
      // .expect(200);

      expect(data.body).toEqual(newTask);
    });

    //Test get all
    test('It should get all the tasks', async () => {

      const expected =
      {
        id: 2,
        todo: 'Trash',
        completed: false,
        user_id: 2
      };

      const data = await fakeRequest(app)
        .get('/api/todos')
        .set('Authorization', token);
      // .expect('Content-Type', /json/)
      // .expect(200);

      expect(data.body).toEqual(expected);
    });

    //Test get a single task
    test('Return a single task', async () => {

      const expected =
      {
        id: 2,
        todo: 'Trash',
        completed: false,
        user_id: 2
      };

      const data = await fakeRequest(app)
        .get('/api/todos/2')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expected);


      const nothing = await fakeRequest(app)
        .get('/api/todos/100')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(nothing.body).toEqual('');
    });

    //Test put
    test('Update a single task', async () => {

      const newTask =
      {
        todo: 'Trash',
        completed: true,
      };


      const expectedTask = {
        ...newTask,
        id: 2,
        user_id: 2
      };

      await fakeRequest(app)
        .put('/api/todos/2')
        .send(newTask)
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      const updatedTask = await fakeRequest(app)
        .get('/api/todos/2')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(updatedTask.body).toEqual(expectedTask);
    });

  });
});
