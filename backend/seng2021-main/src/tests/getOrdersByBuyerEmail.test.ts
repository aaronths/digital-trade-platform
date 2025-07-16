// __tests__/getOrdersByBuyerEmail.test.ts
import { getOrdersByBuyerEmail } from '../services/buyerService';
const pool = require('../db');

jest.mock('../db', () => ({
  query: jest.fn()
}));

describe('Helper function: getOrdersByBuyerEmail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return orders excluding ORDER_REGISTERED', async () => {
    const mockOrders = [
      { orderId: 1, status: 'PENDING_BUYER_REVIEW' },
      { orderId: 2, status: 'ORDER_ACCEPTED' }
    ];

    pool.query.mockResolvedValueOnce({
      rows: mockOrders
    });

    const result = await getOrdersByBuyerEmail('buyer@example.com');
    expect(result).toEqual(mockOrders);
    expect(pool.query).toHaveBeenCalledWith(expect.any(String), ['buyer@example.com']);
  });

  test('should return empty array if no orders found', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const result = await getOrdersByBuyerEmail('noorders@example.com');
    expect(result).toEqual([]);
  });

  test('should throw if database fails', async () => {
    pool.query.mockRejectedValueOnce(new Error('DB error'));

    await expect(getOrdersByBuyerEmail('fail@example.com')).rejects.toThrow('DB error');
  });
});
