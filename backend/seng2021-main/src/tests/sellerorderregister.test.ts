import dotenv from 'dotenv';
dotenv.config(); // Load .env variables

import app from '../app';
import { Server } from 'http';
import request from 'supertest';
import { Pool } from 'pg';
import * as sellerService from '../services/sellerService';

jest.mock('../services/sellerService', () => ({
    isValidOrderId: jest.fn(),
    hasOrderStatus: jest.fn(),
    getOrderDetails: jest.fn(),
    createUBLDocument: jest.fn(),
}));

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

let server: Server;
const PORT = 3000; 

const validApiKey = process.env.VALID_API_KEY || 'NoTuna'; // Fallback if .env is missing

// Start the server before tests
beforeAll(async () => {
    server = app.listen(PORT, () => {
        console.log(`Test server started on port ${PORT}`);
    });
});

// Close the server after tests
afterAll(async () => {
    await new Promise<void>((resolve) => {
        server.close(() => {
            console.log('Test server closed');
            resolve();
        });
    });
});

describe('PUT /shop/seller/:orderId/order-register', () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Reset mocks before each test
    });

    // Order Validation Tests
    test('should return 400 for invalid order ID format', async () => {
        const response = await request(app)
            .put('/shop/seller/invalid/order-register')
            .set('Authorization', validApiKey)
            .send();

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Invalid orderId');
    });

    test('should return 400 if order is not found', async () => {
        (sellerService.isValidOrderId as jest.Mock).mockResolvedValueOnce(false);

        const response = await request(app)
            .put('/shop/seller/10/order-register')
            .set('Authorization', validApiKey)
            .send();

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Order not found');
    });

    test('should return 403 if order status is not "SELLER_ORDER_ACCEPTED"', async () => {
        (sellerService.isValidOrderId as jest.Mock).mockResolvedValueOnce(true);
        (sellerService.hasOrderStatus as jest.Mock).mockResolvedValueOnce(false);

        const response = await request(app)
            .put('/shop/seller/10/order-register')
            .set('Authorization', validApiKey)
            .send();

        expect(response.status).toBe(403);
        expect(response.body.message).toBe('Order status is not SELLER_ORDER_ACCEPTED');
    });

    // Successful Order Registration
    test('should return 200 and register order successfully', async () => {
        (sellerService.isValidOrderId as jest.Mock).mockResolvedValueOnce(true);
        (sellerService.hasOrderStatus as jest.Mock).mockResolvedValueOnce(true);
        (sellerService.getOrderDetails as jest.Mock).mockResolvedValueOnce({
            orderId: 10,
            orderDate: '2024-03-15',
            price: 1500,
            paymentDetails: 'Credit Card - ****1234',
            quantity: 3,
            deliveryAddress: '123 Main St, Apartment 4B, New York, NY 10001',
            contractData: 'Contract reference number: ABC123456',
            response: 'Approved',
            details: 'Urgent delivery required',
            orderStatus: 'SELLER_ORDER_ACCEPTED',
            buyer: {
                name: 'Buyer Co.',
                address: '123 Buyer St, New York, NY 10001',
                phone: '+11234567890',
                email: 'buyer@example.com',
                tax: '123-45-6789',
            },
            seller: {
                name: 'Seller Inc.',
                address: '456 Seller Ave, Los Angeles, CA 90001',
                phone: '+19876543210',
                email: 'seller@example.com',
                tax: '987-65-4321',
            },
            product: {
                id: 123456,
                tax: 5,
                description: 'Wireless mouse',
            },
        });

        (sellerService.createUBLDocument as jest.Mock).mockReturnValueOnce('<UBLDocument>...</UBLDocument>');
        mockQuery.mockResolvedValueOnce({ rowCount: 1 });

        const response = await request(app)
            .put('/shop/seller/10/order-register')
            .set('Authorization', validApiKey)
            .send();

        expect(response.status).toBe(200);
        expect(response.header['content-type']).toContain('application/xml');
        expect(response.text).toContain('<UBLDocument>');
    });

    // Error Handling Tests
    test('should return 500 if order details retrieval fails', async () => {
        (sellerService.isValidOrderId as jest.Mock).mockResolvedValueOnce(true);
        (sellerService.hasOrderStatus as jest.Mock).mockResolvedValueOnce(true);
        (sellerService.getOrderDetails as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

        const response = await request(app)
            .put('/shop/seller/10/order-register')
            .set('Authorization', validApiKey)
            .send();

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Failed to register order');
    });

    test('should return 500 if UBL document creation fails', async () => {
        (sellerService.isValidOrderId as jest.Mock).mockResolvedValueOnce(true);
        (sellerService.hasOrderStatus as jest.Mock).mockResolvedValueOnce(true);
        (sellerService.getOrderDetails as jest.Mock).mockResolvedValueOnce({
            orderId: 10,
            orderStatus: 'SELLER_ORDER_ACCEPTED',
            buyer: { name: 'Buyer Co.' },
            seller: { name: 'Seller Inc.' },
            product: { id: 1, description: 'Sample Product' },
        });

        (sellerService.createUBLDocument as jest.Mock).mockImplementation(() => {
            throw new Error('UBL generation failed');
        });

        const response = await request(app)
            .put('/shop/seller/10/order-register')
            .set('Authorization', validApiKey)
            .send();

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Failed to register order');
    });

    test('should return 500 if order status update fails', async () => {
        (sellerService.isValidOrderId as jest.Mock).mockResolvedValueOnce(true);
        (sellerService.hasOrderStatus as jest.Mock).mockResolvedValueOnce(true);
        (sellerService.getOrderDetails as jest.Mock).mockResolvedValueOnce({
            orderId: 10,
            orderStatus: 'SELLER_ORDER_ACCEPTED',
            buyer: { name: 'Buyer Co.' },
            seller: { name: 'Seller Inc.' },
            product: { id: 1, description: 'Sample Product' },
        });

        (sellerService.createUBLDocument as jest.Mock).mockReturnValueOnce('<UBLDocument>...</UBLDocument>');
        mockQuery.mockRejectedValueOnce(new Error('Database update failed'));

        const response = await request(app)
            .put('/shop/seller/10/order-register')
            .set('Authorization', validApiKey)
            .send();

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Failed to register order');
    });
});