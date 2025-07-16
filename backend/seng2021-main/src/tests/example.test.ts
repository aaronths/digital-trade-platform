import app from '../app';
import request from 'supertest';

// // Start the server before tests
// beforeAll(async () => {
//   server = app.listen(PORT, () => {
//     console.log(`Test server started on port ${PORT}`);
//   });
// });

// // Close the server after tests
// afterAll(async () => {
//   await new Promise<void>((resolve, reject) => {
//     server.close((err) => {
//       if (err) {
//         reject(err);
//       } else {
//         console.log('Test server closed');
//         resolve();
//       }
//     });
//   });
// });

describe('/POST Example', () => {
  test('Should return 200 Status Code', async () => {
    const response = await request(app)
      .post("/submit")
      .set('authorization', 'SENG2021')
      .send({
        name: "Aaron",
        email: "user@example.com"
      });
    expect(response.statusCode).toBe(200);
  });

  test('Should return 400 Status Code', async () => {
    const response = await request(app)
      .post("/submit")
      .set('authorization', 'SENG2021')
      .send({
        name: "Aaron",
        email: "invalidemail"
      });
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Invalid Email");
  });
});
  

