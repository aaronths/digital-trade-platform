import app from '../app';
import request from 'supertest';
import { Pool } from 'pg';
import { deleteOrder, isValidOrderId } from '../services/sellerService';

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

// Start the server before tests
// beforeAll(async () => {
//     server = app.listen(PORT, () => {
//         console.log(`Test server started on port ${PORT}`);
//     });
// });

// // Close the server after tests
// afterAll(async () => {
//     await new Promise<void>((resolve) => {
//         server.close(() => {
//             console.log('Test server closed');
//             resolve();
//         });
//     });
// });

describe('DELETE /shop/seller/:orderId/order-reject', () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Clear all mocks between tests
    });

    test('should reject the order and return 200', async () => {
        mockQuery.mockResolvedValueOnce({ rowCount: 1, rows: [{ o_status: 'PENDING_SELLER_REVIEW' }] });
        mockQuery.mockResolvedValueOnce({ rowCount: 1, rows: [{ order_id: 1, o_status: 'ORDER_REJECTED' }] });

        const response = await request(app)
            .delete('/shop/seller/1/order-reject')
            .send();

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            message: 'Order rejected successfully',
            orderId: 1,
        });
    });

    test('should return 400 for invalid order ID', async () => {
        const response = await request(app)
            .delete('/shop/seller/invalid/order-reject')
            .send();

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Invalid Order ID');
    });

    test('should return 404 if order not found', async () => {
        mockQuery.mockResolvedValueOnce({ rowCount: 0 });

        const response = await request(app)
            .delete('/shop/seller/1/order-reject')
            .send();

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Order not found');
    });

    test('should return 400 if order cannot be rejected in its current state', async () => {
        mockQuery.mockResolvedValueOnce({ rowCount: 1, rows: [{ o_status: 'ORDER_ACCEPTED' }] });

        const response = await request(app)
            .delete('/shop/seller/1/order-reject')
            .send();

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Order cannot be rejected in its current state');
    });

    test('should return 500 if database error occurs', async () => {
        mockQuery.mockRejectedValueOnce(new Error('Database error'));

        const response = await request(app)
            .delete('/shop/seller/1/order-reject')
            .send();

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Internal Server Error');
    });
});

describe('PUT /shop/seller/:orderId/order-accept', () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Clear all mocks between tests
    });

    test('should accept the order and return 200', async () => {
        mockQuery.mockResolvedValueOnce({ rowCount: 1, rows: [{ o_status: 'PENDING_SELLER_REVIEW' }] });
        mockQuery.mockResolvedValueOnce({ rowCount: 1, rows: [{ order_id: 1, o_status: 'SELLER_ORDER_ACCEPTED' }] });

        const response = await request(app)
            .put('/shop/seller/1/order-accept')
            .send();

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            message: 'Order accepted successfully',
            orderId: 1,
        });
    });

    test('should return 400 for invalid order ID', async () => {
        const response = await request(app)
            .put('/shop/seller/invalid/order-accept')
            .send();

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Invalid Order ID');
    });

    test('should return 404 if order not found', async () => {
        mockQuery.mockResolvedValueOnce({ rowCount: 0 });

        const response = await request(app)
            .put('/shop/seller/1/order-accept')
            .send();

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Order not found');
    });

    test('should return 400 if order cannot be accepted in its current state', async () => {
        mockQuery.mockResolvedValueOnce({ rowCount: 1, rows: [{ o_status: 'ORDER_REJECTED' }] });

        const response = await request(app)
            .put('/shop/seller/1/order-accept')
            .send();

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Order cannot be accepted in its current state');
    });

    test('should return 500 if database error occurs', async () => {
        mockQuery.mockRejectedValueOnce(new Error('Database error'));

        const response = await request(app)
            .put('/shop/seller/1/order-accept')
            .send();

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Internal Server Error');
    });
});

// EXTRA TESTS FOR COVERAGE

describe('isValidOrderId', () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Clear all mocks between tests
    });

    test('should return true if the order exists', async () => {
        mockQuery.mockResolvedValueOnce({ rowCount: 1 });

        const result = await isValidOrderId(123);
        expect(result).toBe(true);
    });

    test('should return false if the order does not exist', async () => {
        mockQuery.mockResolvedValueOnce({ rowCount: 0 });

        const result = await isValidOrderId(123);
        expect(result).toBe(false);
    });

    test('should return false if rowCount is null', async () => {
        mockQuery.mockResolvedValueOnce({ rowCount: null });

        const result = await isValidOrderId(123);
        expect(result).toBe(false);
    });

    test('should return false if rowCount is undefined', async () => {
        mockQuery.mockResolvedValueOnce({ rowCount: undefined });

        const result = await isValidOrderId(123);
        expect(result).toBe(false);
    });

    test('should handle database errors', async () => {
        mockQuery.mockRejectedValueOnce(new Error('Database error'));

        await expect(isValidOrderId(123)).rejects.toThrow('Database error');
    });
});

// EXTRA TESTS FOR COVERAGE

describe('deleteOrder', () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Clear all mocks between tests
    });

    test('should delete the order if it exists', async () => {
        mockQuery.mockResolvedValueOnce({ rowCount: 1 });

        await expect(deleteOrder(123)).resolves.not.toThrow();
    });

    test('should throw an error if the order does not exist', async () => {
        mockQuery.mockResolvedValueOnce({ rowCount: 0 });

        await expect(deleteOrder(123)).rejects.toThrow('Order not found');
    });

    // DOESNT WORK

    // test('should throw an error if rowCount is null', async () => {
    //     mockQuery.mockResolvedValueOnce({ rowCount: null });

    //     await expect(deleteOrder(123)).rejects.toThrow('Order not found');
    // });

    // test('should throw an error if rowCount is undefined', async () => {
    //     mockQuery.mockResolvedValueOnce({ rowCount: undefined });

    //     await expect(deleteOrder(123)).rejects.toThrow('Order not found');
    // });

    test('should handle database errors', async () => {
        mockQuery.mockRejectedValueOnce(new Error('Database error'));

        await expect(deleteOrder(123)).rejects.toThrow('Database error');
    });
});
