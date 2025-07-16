import request from 'supertest';
import app from '../app'; 

test('Invalid Route', async () => {
    const response = await request(app)
    .post('/invalid/route')
    .send({random: 'random_input'});
    expect(response.status).toBe(404);
    expect(response.body.error).toBe(`
      Route not found - This could be because:
        0. You have defined routes below (not above) this middleware in server.ts
        1. You have not implemented the route POST /invalid/route
        2. There is a typo in either your test or server, e.g. /posts/list in one
           and, incorrectly, /post/list in the other
        3. You are using ts-node (instead of ts-node-dev) to start your server and
           have forgotten to manually restart to load the new changes
        4. You've forgotten a leading slash (/), e.g. you have posts/list instead
           of /posts/list in your server.ts or test file
    `);
})