import request from 'supertest';
import app from '../app'; 
const pool = require('../db');


jest.mock('../db', () => ({
    query: jest.fn().mockImplementation((queryText, values) => {
        console.log('query called with:', queryText, values);
        return Promise.resolve({
            rows: [{ order_id: 1 }],
            rowCount: 1,  // Ensure rowCount is included
        });
    }),
}));

// successful test

test('should update response and return orderId', async () => {
    pool.query.mockResolvedValueOnce({
        rows: [{ order_id: 1 }],
        rowCount: 1
    });
    const response = await request(app)
    .post('/shop/seller/1/order-create-response')
    .set('authorization', 'SENG2021')
    .send({
        response: "order not good, do again"});
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ newResponse: "order not good, do again" });
});

test('should return 401 if no orderId', async () => {
    const response = await request(app)
    .post('/shop/seller/kanye/order-create-response')
    .set('authorization', 'SENG2021')
    .send({
        response: "order not good, do again"});
    expect(response.status).toBe(401);
    expect(response.body.message).toBe("OrderId is empty or invalid");
});

test('should return 401 if orderId is out of the current range', async () => {
    pool.query.mockResolvedValueOnce({
        rows: [{ order_id: 55 }],
        rowCount: 0
    });
    const response = await request(app)
    .post('/shop/seller/55/order-create-response')
    .set('authorization', 'SENG2021')
    .send({
        response: "order not good, do again"});
    console.log(response.body);
    expect(response.status).toBe(401);
    expect(response.body.message).toBe("OrderId is empty or invalid");
});