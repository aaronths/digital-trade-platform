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

describe('POST /shop/add-new-product-v2', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return 400 if any product field is missing', async () => {
    const response = await request(app).post('/shop/add-new-product-v2').send({
      name: 'Wireless Mouse',
      tax: '5%',
      description: 'A high-quality wireless mouse'
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('All product fields must be valid and non-empty');
  });

  test('should return 400 if product fields are invalid or empty', async () => {
    const response = await request(app).post('/shop/add-new-product-v2').send({
      name: '  ',
      price: 'not-a-number',
      tax: '',
      description: ''
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('All product fields must be valid and non-empty');
  });

  test('should return 200 and product info if valid input is given', async () => {
    const mockProduct = {
      name: 'Wireless Keyboard',
      price: 49,
      tax: '10%',
      description: 'A compact wireless keyboard'
    };

    const mockResult = {
      rows: [{
        p2_name: mockProduct.name,
        p2_price: mockProduct.price,
        p2_tax: mockProduct.tax,
        p2_desc: mockProduct.description,
      }],
    };

    mockQuery.mockResolvedValueOnce(mockResult);

    const response = await request(app).post('/shop/add-new-product-v2').send(mockProduct);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Product added successfully');
    expect(response.body.product.p2_name).toBe(mockProduct.name);
    expect(response.body.product.p2_price).toBe(mockProduct.price);
    expect(response.body.product.p2_tax).toBe(mockProduct.tax);
    expect(response.body.product.p2_desc).toBe(mockProduct.description);
  });

  test('should return 500 on database error', async () => {
    mockQuery.mockImplementationOnce(() => {
      throw new Error('Database failure');
    });

    const response = await request(app).post('/shop/add-new-product-v2').send({
      name: 'Test Product',
      price: 20,
      tax: '5%',
      description: 'Demo description'
    });

    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Database failure');
  });
});
