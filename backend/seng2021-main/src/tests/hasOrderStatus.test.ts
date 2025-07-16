// Ensure Jest mocks `pg` before importing sellerService
jest.mock('pg', () => {
    const mockQuery = jest.fn(); // Define query mock
    const mockPoolInstance = { query: mockQuery }; // Define mock pool
 
    return { Pool: jest.fn(() => mockPoolInstance) }; // Return mock pool
});
 
import * as sellerService from '../services/sellerService';
import { Pool } from 'pg';
 
// Use the same mocked instance globally
const pool = new Pool();
const mockQuery = pool.query as jest.Mock; // Ensure this is declared only once
 
describe('hasOrderStatus', () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Reset mocks before each test
    });
 
    // Should return true when order exists with correct status
    test('should return true when order exists with correct status', async () => {
        mockQuery.mockResolvedValueOnce({ rowCount: 1 }); // Simulate DB returning a match
 
        const result = await sellerService.hasOrderStatus(10, 'SELLER_ORDER_ACCEPTED');
 
        expect(result).toBe(true);
        expect(mockQuery).toHaveBeenCalledWith(
            'SELECT 1 FROM orders WHERE order_id = $1 AND o_status = $2',
            [10, 'SELLER_ORDER_ACCEPTED']
        );
    });
 
    // Should return false when order exists but has different status
    test('should return false when order exists but has different status', async () => {
        mockQuery.mockResolvedValueOnce({ rowCount: 0 });
 
        const result = await sellerService.hasOrderStatus(10, 'ORDER_REJECTED');
 
        expect(result).toBe(false);
    });
 
    // Should return false when order does not exist
    test('should return false when order does not exist', async () => {
        mockQuery.mockResolvedValueOnce({ rowCount: 0 });
 
        const result = await sellerService.hasOrderStatus(999, 'SELLER_ORDER_ACCEPTED');
 
        expect(result).toBe(false);
    });
});