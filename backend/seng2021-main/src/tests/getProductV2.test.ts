import app from '../app';
import request from 'supertest';
import { Pool } from 'pg';

// Mock the pg Pool
jest.mock('pg', () => {
  const mockPool = {
    query: jest.fn(),
  };
  return { Pool: jest.fn(() => mockPool) };
});

const pool = new Pool();
const mockQuery = pool.query as jest.Mock;

describe('GET /shop/product-v2/:id', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return 400 if product ID is invalid', async () => {
    const response = await request(app).get('/shop/product-v2/not-a-number');
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Invalid product ID');
  });

  test('should return 404 if product not found', async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 0 });
    const response = await request(app).get('/shop/product-v2/999');
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Product not found');
  });

  test('should return 200 and product info if valid ID is given', async () => {
    const mockProduct = {
      p2_id: 1,
      p2_name: 'Wireless Keyboard',
      p2_price: 49,
      p2_tax: '10%',
      p2_desc: 'A compact wireless keyboard',
    };

    mockQuery.mockResolvedValueOnce({ rowCount: 1, rows: [mockProduct] });

    const response = await request(app).get('/shop/product-v2/1');
    expect(response.status).toBe(200);
    expect(response.body.product).toEqual(mockProduct);
  });

  test('should return 500 on database error', async () => {
    mockQuery.mockImplementationOnce(() => {
      throw new Error('Database failure');
    });

    const response = await request(app).get('/shop/product-v2/1');
    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Failed to retrieve product');
  });
});
