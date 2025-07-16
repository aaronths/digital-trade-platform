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

describe('POST /shop/buyer/order', () => {
    beforeEach(() => {
        pool.query.mockResolvedValueOnce({
            rows: [{ order_id: 1 }],
            rowCount: 1
        });
    });

    afterEach(() => {
        jest.clearAllMocks(); 
    });
  
    test('should create an order and return orderId', async () => {
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
        expect(response.status).toBe(200);
        expect(response.body).toEqual(
            { message: 'Order accepted successfully',
            orderId: 1 });
    });

    test('should return 401 if no API Key', async () => {
        const response = await request(app)
        .post('/shop/buyer/order')
        .send({
            price: 100, 
            paymentDetails: 'Payment details here',
            quantity: 1,
            deliveryAddress: '123 Main St',
            contractData: 'Contract data here',
            buyerCompanyName: 'Buyer Co.',
            sellerCompanyName: 'Seller Co.',
            productId: '12345',
        });
        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Supply a valid API Key");
    });

    test('should return 401 if invalid API Key', async () => {
        const response = await request(app)
        .post('/shop/buyer/order')
        .set('authorization', 'InvalidAPIKey')
        .send({
            price: 100, 
            paymentDetails: 'Payment details here',
            quantity: 1,
            deliveryAddress: '123 Main St',
            contractData: 'Contract data here',
            buyerCompanyName: 'Buyer Co.',
            sellerCompanyName: 'Seller Co.',
            productId: '12345',
        });
        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Invalid API Key");
    });
  
    test('should return 400 if validation fails', async () => {
        const response = await request(app)
        .post('/shop/buyer/order')
        .set('authorization', 'SENG2021')
        .send({
            price: -100, // Invalid price
            paymentDetails: 'Payment details here',
            quantity: 1,
            deliveryAddress: '123 Main St',
            contractData: 'Contract data here',
            buyerCompanyName: 'Buyer Co.',
            sellerCompanyName: 'Seller Co.',
            productId: '12345',
        });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("\"price\" must be greater than or equal to 0");
    });
});
  

// Testing for buyer/order_cancel
describe(`PUT /shop/buyer/:orderId/order-cancel`, () => {
    let orderId: number;

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

    afterEach(() => {
        jest.clearAllMocks(); // Clear any previous mocks between tests
    });

    test('should cancel an order and return "Order Cancelled"', async () => {
        const response = await request(app)
        .put(`/shop/buyer/${orderId}/order-cancel`)
        .set('authorization', 'SENG2021')
        .send();

        expect(response.status).toBe(200);
        expect(response.body.message).toBe(`Order ${orderId} successfully cancelled`);
    });

    test('Invalid order Id and return Order Cancelled failed', async () => {
        const invalidOrderId = 300;
        pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
        const response = await request(app)
        .put(`/shop/buyer/${invalidOrderId}/order-cancel`)
        .set('authorization', 'SENG2021')
        .send();
        
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Order cancellation failed: Invalid OrderId');
    });

    test('Invalid order Id and return Order Cancelled failed', async () => {
        const invalidOrderId =  'abc';
        pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
        const response = await request(app)
        .put(`/shop/buyer/${invalidOrderId}/order-cancel`)
        .set('authorization', 'SENG2021')
        .send();
        
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Order cancellation failed: Invalid OrderId');
    });
    
    
    test('Invalid API key', async () => {
        pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
        const response = await request(app)
        .put(`/shop/buyer/${orderId}/order-cancel`)
        .set('authorization', 'InvalidKey')
        .send();
        
        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Invalid API Key');
    });
});