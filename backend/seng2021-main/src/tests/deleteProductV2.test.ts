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

describe('DELETE /shop/delete-product-v2', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return 400 if product ID is not provided or invalid', async () => {
    const response = await request(app).delete('/shop/delete-product-v2').send({ id: '' });
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Valid product ID must be provided');
  });

  test('should return 404 if product not found', async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 0 });

    const response = await request(app).delete('/shop/delete-product-v2').send({ id: 999 });
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Product not found');
  });

  test('should return 200 and deleted product info if valid ID is given', async () => {
    const mockDeleted = {
      p2_id: 1,
      p2_name: 'Wireless Keyboard',
      p2_price: 49,
      p2_tax: '10%',
      p2_desc: 'A compact wireless keyboard',
    };

    mockQuery.mockResolvedValueOnce({ rowCount: 1, rows: [mockDeleted] });

    const response = await request(app).delete('/shop/delete-product-v2').send({ id: 1 });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Product deleted successfully');
    expect(response.body.deletedProduct).toEqual(mockDeleted);
  });

  test('should return 500 on database error', async () => {
    mockQuery.mockImplementationOnce(() => {
      throw new Error('Database failure');
    });

    const response = await request(app).delete('/shop/delete-product-v2').send({ id: 1 });
    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Database failure');
  });
});
