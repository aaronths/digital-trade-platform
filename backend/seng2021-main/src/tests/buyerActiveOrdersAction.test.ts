import app from '../app';
import request from 'supertest';
import { Server } from 'http';
import * as buyerService from '../services/buyerService';
import * as userService from '../services/loginService';

jest.mock('../services/buyerService', () => ({
  getOrdersByBuyerEmail: jest.fn()
}));

jest.mock('../services/loginService', () => ({
  findUserByEmail: jest.fn()
}));

let server: Server;
beforeAll(() => {
  server = app.listen(3003, () => {
    console.log('Test server started on port 3003');
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

describe('GET /shop/buyer/:buyerId/active-orders-action', () => {
  const validEmail = 'buyer@example.com';
  const buyerId = 1;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return 400 if email is not provided', async () => {
    const response = await request(app).get(`/shop/buyer/${buyerId}/active-orders-action`);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Buyer email is required');
  });

  test('should return 404 if email does not exist in DB', async () => {
    (userService.findUserByEmail as jest.Mock).mockResolvedValueOnce(null);

    const response = await request(app)
      .get(`/shop/buyer/${buyerId}/active-orders-action`)
      .query({ email: validEmail });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Buyer email not found');
  });

  test('should return 200 and list of orders with PENDING_BUYER_REVIEW status only', async () => {
    (userService.findUserByEmail as jest.Mock).mockResolvedValueOnce({ email: validEmail });
    (buyerService.getOrdersByBuyerEmail as jest.Mock).mockResolvedValueOnce([
      { orderId: 1, status: 'PENDING_BUYER_REVIEW' },
      { orderId: 2, status: 'ORDER_ACCEPTED' },
      { orderId: 3, status: 'PENDING_BUYER_REVIEW' }
    ]);

    const response = await request(app)
      .get(`/shop/buyer/${buyerId}/active-orders-action`)
      .query({ email: validEmail });

    expect(response.status).toBe(200);
    expect(response.body.orders).toHaveLength(2);
    response.body.orders.forEach((order: Order) => {
      expect(order.status).toBe('PENDING_BUYER_REVIEW');
    });
  });

  test('should return 500 if internal error occurs', async () => {
    (userService.findUserByEmail as jest.Mock).mockImplementation(() => {
      throw new Error('Unexpected error');
    });

    const response = await request(app)
      .get(`/shop/buyer/${buyerId}/active-orders-action`)
      .query({ email: validEmail });

    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Unexpected error');
  });
});
