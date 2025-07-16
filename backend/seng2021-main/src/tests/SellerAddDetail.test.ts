import app from '../app';
import request from 'supertest';
import { Server } from 'http';
import { Pool } from 'pg';
import * as sellerService from '../services/sellerService';

jest.mock('../services/sellerService', () => ({
    isValidOrderId: jest.fn(),
    hasOrderStatus: jest.fn(),
}));

jest.mock('pg', () => {
    const mockPool = {
        query: jest.fn(),
    };
    return { Pool: jest.fn(() => mockPool) };
});

const pool = new Pool();
const mockQuery = pool.query as jest.Mock;
let server: Server;
const PORT = 3000;

// Start Test Server Before Tests
beforeAll(() => {
    server = app.listen(PORT, () => {
        console.log(`Test server started on port ${PORT}`);
    });
});

// Close Server After Tests
afterAll(async () => {
    await new Promise<void>((resolve) => {
        server.close(() => {
            console.log('Test server closed');
            resolve();
        });
    });
});

describe('PUT /shop/seller/:orderId/order-add-detail', () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Reset mocks before each test
    });

    // Should return 400 for invalid order ID format
    test('should return 400 for invalid order ID format', async () => {
        const response = await request(app)
            .put('/shop/seller/invalid/order-add-detail')
            .set('Authorization', 'NoTuna') // Valid API key
            .send({ responseText: 'Additional details' });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Invalid orderId');
    });

    // Should return 400 if order is not found
    test('should return 400 if order is not found', async () => {
        (sellerService.isValidOrderId as jest.Mock).mockResolvedValueOnce(false);

        const response = await request(app)
            .put('/shop/seller/10/order-add-detail')
            .set('Authorization', 'NoTuna')
            .send({ responseText: 'Additional details' });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Order not found');
    });

    // Should return 403 if order status is not "PENDING_SELLER_REVIEW"
    test('should return 403 if order status is incorrect', async () => {
        (sellerService.isValidOrderId as jest.Mock).mockResolvedValueOnce(true);
        (sellerService.hasOrderStatus as jest.Mock).mockResolvedValueOnce(false);

        const response = await request(app)
            .put('/shop/seller/10/order-add-detail')
            .set('Authorization', 'NoTuna')
            .send({ responseText: 'Additional details' });

        expect(response.status).toBe(403);
        expect(response.body.message).toBe('Order status is not PENDING_SELLER_REVIEW');
    });

    // Should return 400 if responseText is missing
    test('should return 400 if responseText is missing', async () => {
        (sellerService.isValidOrderId as jest.Mock).mockResolvedValueOnce(true);
        (sellerService.hasOrderStatus as jest.Mock).mockResolvedValueOnce(true);

        const response = await request(app)
            .put('/shop/seller/10/order-add-detail')
            .set('Authorization', 'NoTuna')
            .send({});

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Response text is required');
    });

    // Should update response and change status to "PENDING_BUYER_REVIEW"
    test('should update response and status successfully', async () => {
        (sellerService.isValidOrderId as jest.Mock).mockResolvedValueOnce(true);
        (sellerService.hasOrderStatus as jest.Mock).mockResolvedValueOnce(true);
        mockQuery.mockResolvedValueOnce({
            rowCount: 1,
            rows: [{ response: 'Additional details from seller', o_status: 'PENDING_BUYER_REVIEW' }],
        });

        const response = await request(app)
            .put('/shop/seller/10/order-add-detail')
            .set('Authorization', 'NoTuna')
            .send({ responseText: 'Additional details from seller' });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Response updated successfully');
        expect(response.body.orderId).toBe(10);
        expect(response.body.responseText).toBe('Additional details from seller');
        expect(response.body.newStatus).toBe('PENDING_BUYER_REVIEW');
    });

    // Should return 500 if database update fails
    test('should return 500 if database update fails', async () => {
        (sellerService.isValidOrderId as jest.Mock).mockResolvedValueOnce(true);
        (sellerService.hasOrderStatus as jest.Mock).mockResolvedValueOnce(true);
        mockQuery.mockRejectedValueOnce(new Error('Database error'));

        const response = await request(app)
            .put('/shop/seller/10/order-add-detail')
            .set('Authorization', 'NoTuna')
            .send({ responseText: 'Additional details from seller' });

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Failed to add detail to order');
    });

    // Should return 500 if order status update fails
    test('should return 500 if order status update fails', async () => {
        (sellerService.isValidOrderId as jest.Mock).mockResolvedValueOnce(true);
        (sellerService.hasOrderStatus as jest.Mock).mockResolvedValueOnce(true);
        mockQuery.mockResolvedValueOnce({ rowCount: 0 }); // Simulating a failed update

        const response = await request(app)
            .put('/shop/seller/10/order-add-detail')
            .set('Authorization', 'NoTuna')
            .send({ responseText: 'Additional details from seller' });

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Failed to update order response');
    });
});
