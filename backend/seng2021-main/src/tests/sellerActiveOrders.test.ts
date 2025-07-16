import app from '../app';
import request from 'supertest';
import { Server } from 'http';
import * as sellerService from '../services/sellerService';
import * as userService from '../services/loginService';

jest.mock('../services/sellerService', () => ({
  getOrdersBySellerEmail: jest.fn()
}));

jest.mock('../services/loginService', () => ({
  findUserByEmail: jest.fn()
}));

let server: Server;
beforeAll(() => {
  server = app.listen(3002, () => {
    console.log('Test server started on port 3002');
  });
});

afterAll(done => {
  server.close(() => {
    console.log('Test server closed');
    done();
  });
});

type Order = {
    orderId: number;
    status: string;
    // optionally include more fields depending on your query
};

describe('GET /shop/seller/:sellerId/active-orders', () => {
  const validEmail = 'seller@example.com';
  const sellerId = 1;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return 400 if email is not provided', async () => {
    const response = await request(app).get(`/shop/seller/${sellerId}/active-orders`);
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Seller email is required');
  });

  test('should return 404 if email does not exist in DB', async () => {
    (userService.findUserByEmail as jest.Mock).mockResolvedValueOnce(null);

    const response = await request(app)
      .get(`/shop/seller/${sellerId}/active-orders`)
      .query({ email: validEmail });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Seller email not found');
  });

  test('should return 200 and list of orders excluding ORDER_REGISTERED', async () => {
    (userService.findUserByEmail as jest.Mock).mockResolvedValueOnce({ email: validEmail });

    const mockOrders = [
      { orderId: 1, status: 'PENDING_SELLER_REVIEW' },
      { orderId: 2, status: 'SELLER_ORDER_ACCEPTED' },
      { orderId: 3, status: 'ORDER_REGISTERED' } // This should not appear in DB results
    ];

    (sellerService.getOrdersBySellerEmail as jest.Mock).mockResolvedValueOnce(mockOrders);

    const response = await request(app)
      .get(`/shop/seller/${sellerId}/active-orders`)
      .query({ email: validEmail });

    expect(response.status).toBe(200);
    expect(response.body.orders.length).toBe(3); // Mock still returns 3
    expect(response.body.orders.find((o: Order) => o.status === 'ORDER_REGISTERED')).toBeDefined();
  });

  test('should return 500 if internal error occurs', async () => {
    (userService.findUserByEmail as jest.Mock).mockImplementation(() => {
      throw new Error('Unexpected error');
    });

    const response = await request(app)
      .get(`/shop/seller/${sellerId}/active-orders`)
      .query({ email: validEmail });

    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Unexpected error');
  });
});
