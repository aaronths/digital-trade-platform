import app from '../app';
import request from 'supertest';
import { Pool } from 'pg';

// Mock the pg Pool
jest.mock('pg', () => {
    const mockPool = {
        query: jest.fn(), // Explicitly mock the query method
    };
    return { Pool: jest.fn(() => mockPool) };
});

const pool = new Pool();

// Cast pool.query as a Jest mock function
const mockQuery = pool.query as jest.Mock;

describe('PUT /shop/buyer/:orderId/order-accept', () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Clear all mocks between tests
    });

    test('should accept the order and return 200', async () => {
        mockQuery.mockResolvedValueOnce({ rowCount: 1, rows: [{ o_status: 'PENDING_BUYER_REVIEW' }] });
        mockQuery.mockResolvedValueOnce({ rowCount: 1, rows: [{ order_id: 1, o_status: 'SELLER_BUYER_ACCEPTED' }] });

        const response = await request(app)
            .put('/shop/buyer/1/order-accept')
            .set('authorization', 'SENG2021')
            .send();

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            message: 'Order accepted successfully',
            orderId: 1,
        });
    });

    test('should return 400 for invalid order ID', async () => {
        const response = await request(app)
            .put('/shop/buyer/invalid/order-accept')
            .set('authorization', 'SENG2021')
            .send();

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Invalid Order ID');
    });

    test('should return 400 if order not found', async () => {
        mockQuery.mockResolvedValueOnce({ rowCount: 0 });

        const response = await request(app)
            .put('/shop/buyer/1/order-accept')
            .set('authorization', 'SENG2021')
            .send();

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Order not found');
    });

    test('should return 400 if order cannot be accepted in its current state', async () => {
        mockQuery.mockResolvedValueOnce({ rowCount: 1, rows: [{ o_status: 'ORDER_REJECTED' }] });

        const response = await request(app)
            .put('/shop/buyer/1/order-accept')
            .set('authorization', 'SENG2021')
            .send();

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Order cannot be accepted in its current state');
    });

    test('should return 500 if database error occurs', async () => {
        mockQuery.mockRejectedValueOnce(new Error('Database error'));

        const response = await request(app)
            .put('/shop/buyer/1/order-accept')
            .set('authorization', 'SENG2021')
            .send();

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Database error');
    });

    test('should fail authentication and return 401', async () => {
        mockQuery.mockResolvedValueOnce({ rowCount: 1, rows: [{ o_status: 'PENDING_BUYER_REVIEW' }] });
        mockQuery.mockResolvedValueOnce({ rowCount: 1, rows: [{ order_id: 1, o_status: 'SELLER_ORDER_ACCEPTED' }] });

        const response = await request(app)
            .put('/shop/buyer/1/order-accept')
            .set('authorization', 'InvalidAPIKey')
            .send();

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Invalid API Key");
    });

    test('should fail authentication and return 401', async () => {
        mockQuery.mockResolvedValueOnce({ rowCount: 1, rows: [{ o_status: 'PENDING_BUYER_REVIEW' }] });
        mockQuery.mockResolvedValueOnce({ rowCount: 1, rows: [{ order_id: 1, o_status: 'ORDER_ACCEPTED' }] });

        const response = await request(app)
            .put('/shop/buyer/1/order-accept')
            .send();

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Supply a valid API Key");
    });
});