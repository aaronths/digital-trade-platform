import request from 'supertest';
import app from '../app'; 
const pool = require('../db');


jest.mock('../db', () => ({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    query: jest.fn().mockImplementation((_queryText, _values) => {
        return Promise.resolve({
            rows: [{ order_id: 1 }],
            rowCount: 1,  
        });
    }),
}));


describe('DELETE /shop/seller/${orderId}/order-cancel-receive', () => {
    let orderId: number;

    afterEach(() => {
        jest.clearAllMocks(); 
    });

    beforeEach(async () => {
        pool.query.mockResolvedValueOnce({
            rows: [{ order_id: 1 }],
            rowCount: 1
        });
        const response = await request(app)
        .post('/shop/buyer/order')
        .set('authorization', 'SENG2021')
        .send({
            price: 1500,
            paymentDetails: "Credit Card - ****1234",
            quantity: 3,
            deliveryAddress: "123 Main St, Apartment 4B, New York, NY 10001",
            contractData: "Contract reference number: ABC123456",
            buyerCompanyName: "Buyer Co.",
            buyerAddress: "123 Buyer St, New York, NY 10001",
            buyerPhoneNumber: "+11234567890",
            buyerEmail: "buyer@example.com",
            buyerTax: "123-45-6789",
            sellerCompanyName: "Seller Inc.",
            sellerAddress: "456 Seller Ave, Los Angeles, CA 90001",
            sellerPhoneNumber: "+19876543210",
            sellerEmail: "seller@example.com",
            sellerTax: "987-65-4321",
            productId: "123456",
            productTax: "5%",
            productDesc: "Wireless mouse"
        });
        orderId = response.body.orderId;
    });

    test('should delete an order from database and return message', async () => {
        pool.query.mockResolvedValueOnce({ rowCount: 1, rows: [{ o_status: 'ORDER_CANCELLED' }] });

        const response = await request(app)
            .delete(`/shop/seller/${orderId}/order-cancel-receive`)
            .set('authorization', 'SENG2021')
            .send();
       
        expect(response.status).toBe(200);
        expect(response.body.message).toBe(`Order ${orderId} successfully cancelled`);
    });

    test('should return 401 for invalid API key', async () => {
        pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

        const response = await request(app)
            .delete(`/shop/seller/${orderId}/order-cancel-receive`)
            .set('authorization', 'InvalidKey')
            .send();
        
        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Invalid API Key');
    });

    test('should return 400 if order cannot be rejected in its current state', async () => {
        pool.query.mockResolvedValueOnce({ rowCount: 1, rows: [{ o_status: 'ORDER_ACCEPTED' }] });

        const response = await request(app)
            .delete(`/shop/seller/${orderId}/order-cancel-receive`)
            .set('authorization', 'SENG2021')
            .send();

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Order cannot be cancelled in its current state');
    });

    test('Should return 400 for non-existent order ID', async () => {
        const invalidOrderId = 300;

        pool.query.mockResolvedValueOnce({ rowCount: 0 });

        const response = await request(app)
            .delete(`/shop/seller/${invalidOrderId}/order-cancel-receive`)
            .set('authorization', 'SENG2021')
            .send();
        
        expect(response.status).toBe(400);
        expect(response.body.message).toBe(`Order not found`);
    });

    test('Should return 400 for invalid order ID format', async () => {
        const invalidOrderId = 'abc';

        pool.query.mockResolvedValueOnce({ rowCount: 0 });

        const response = await request(app)
            .delete(`/shop/seller/${invalidOrderId}/order-cancel-receive`)
            .set('authorization', 'SENG2021')
            .send();
        
        expect(response.status).toBe(400);
        expect(response.body.message).toBe(`Order cancellation failed: Invalid OrderId`);
    });

    

});
  