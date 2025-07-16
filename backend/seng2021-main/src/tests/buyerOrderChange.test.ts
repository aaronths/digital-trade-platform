import request from 'supertest';
import app from '../app'; 
const pool = require('../db');

jest.mock('../db', () => ({
    query: jest.fn(), // Mock the query method
}));

const mockQuery = pool.query as jest.Mock;

describe('PUT /shop/buyer/:orderId/order-change', () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Clear all mocks between tests
    });
    
    test('should return 404 if order not found', async () => {
        // Mock the order check query to simulate a missing order
        mockQuery.mockResolvedValueOnce({ rowCount: 0 });
    
        const response = await request(app)
            .put('/shop/buyer/1/order-change')
            .set('authorization', 'SENG2021')
            .send({
                buyerCompanyName: 'Buyer Corp',
                sellerCompanyName: 'Seller Corp',
                productId: 123,
                paymentDetails: 'Credit Card',
                deliveryAddress: '123 Main St',
                contractData: 'Contract details',
                quantity: 5,
                price: 100,
            });
    
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Order not found');
    });

    test('should update the order and set status to PENDING_SELLER_REVIEW', async () => {
        // Mock the order check query to simulate an existing order
        mockQuery.mockResolvedValueOnce({ rowCount: 1, rows: [{ order_id: 1 }] });

        // Mock the subqueries for buyer, seller, and product IDs
        mockQuery.mockResolvedValueOnce({ rows: [{ b_id: 1 }] }); // Buyer ID
        mockQuery.mockResolvedValueOnce({ rows: [{ s_id: 1 }] }); // Seller ID
        mockQuery.mockResolvedValueOnce({ rows: [{ p_id: 123 }] }); // Product ID

        // Mock the update query to simulate a successful update
        mockQuery.mockResolvedValueOnce({ rowCount: 1, rows: [{ o_status: 'PENDING_SELLER_REVIEW' }] });

        const response = await request(app)
            .put('/shop/buyer/1/order-change')
            .set('authorization', 'SENG2021')
            .send({
                buyerCompanyName: 'Buyer Corp',
                sellerCompanyName: 'Seller Corp',
                productId: 123,
                paymentDetails: 'Credit Card',
                deliveryAddress: '123 Main St',
                contractData: 'Contract details',
                quantity: 5,
                price: 100,
            });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            message: 'Order updated successfully',
            orderId: 1,
        });

        // Verify the status was updated
        expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining("o_status = 'PENDING_SELLER_REVIEW'"), expect.any(Array));
    });

    test('should return 400 for invalid order ID', async () => {
        const response = await request(app)
            .put('/shop/buyer/invalid/order-change')
            .set('authorization', 'SENG2021')
            .send({
                buyerCompanyName: 'Buyer Corp',
                sellerCompanyName: 'Seller Corp',
                productId: 123,
                paymentDetails: 'Credit Card',
                deliveryAddress: '123 Main St',
                contractData: 'Contract details',
                quantity: 5,
                price: 100,
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Invalid Order ID');
    });

    test('should return 400 if missing required fields', async () => {
        const response = await request(app)
            .put('/shop/buyer/1/order-change')
            .set('authorization', 'SENG2021')
            .send({
                buyerCompanyName: 'Buyer Corp',
                sellerCompanyName: 'Seller Corp',
                productId: 123,
                // Missing paymentDetails, deliveryAddress, contractData, quantity, price
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Missing required fields');
    });
});