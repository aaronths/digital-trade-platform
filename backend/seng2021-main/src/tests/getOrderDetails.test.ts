import * as sellerService from '../services/sellerService';
import { Pool } from 'pg';
 
// Mock the database pool
jest.mock('pg', () => {
    const mockQuery = jest.fn(); // Define query mock
    const mockPoolInstance = { query: mockQuery }; // Define mock pool
    return { Pool: jest.fn(() => mockPoolInstance) }; // Return mock pool
});
 
const pool = new Pool();
const mockQuery = pool.query as jest.Mock;
 
describe('getOrderDetails', () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Reset mocks before each test
    });
 
    // Should return order details when order exists
    test('should return order details for a valid order ID', async () => {
        mockQuery.mockResolvedValueOnce({
            rowCount: 1,
            rows: [
                {
                    order_id: 10,
                    order_date: '2024-03-15',
                    price: 1500,
                    payment_details: 'Credit Card - ****1234',
                    quantity: 3,
                    delivery_address: '123 Main St, Apartment 4B, New York, NY 10001',
                    contract_data: 'Contract reference number: ABC123456',
                    response: 'Approved',
                    details: 'Urgent delivery required',
                    o_status: 'SELLER_ORDER_ACCEPTED',
                    buyer_name: 'Buyer Co.',
                    buyer_address: '123 Buyer St, New York, NY 10001',
                    buyer_phone: '+11234567890',
                    buyer_email: 'buyer@example.com',
                    buyer_tax: '123-45-6789',
                    seller_name: 'Seller Inc.',
                    seller_address: '456 Seller Ave, Los Angeles, CA 90001',
                    seller_phone: '+19876543210',
                    seller_email: 'seller@example.com',
                    seller_tax: '987-65-4321',
                    product_id: '123456',
                    product_tax: '5%',
                    product_desc: 'Wireless mouse',
                },
            ],
        });
 
        const result = await sellerService.getOrderDetails(10);
 
        expect(result).toEqual({
            orderId: 10,
            orderDate: '2024-03-15',
            price: 1500,
            paymentDetails: 'Credit Card - ****1234',
            quantity: 3,
            deliveryAddress: '123 Main St, Apartment 4B, New York, NY 10001',
            contractData: 'Contract reference number: ABC123456',
            response: 'Approved',
            details: 'Urgent delivery required',
            orderStatus: 'SELLER_ORDER_ACCEPTED',
            buyer: {
                name: 'Buyer Co.',
                address: '123 Buyer St, New York, NY 10001',
                phone: '+11234567890',
                email: 'buyer@example.com',
                tax: '123-45-6789',
            },
            seller: {
                name: 'Seller Inc.',
                address: '456 Seller Ave, Los Angeles, CA 90001',
                phone: '+19876543210',
                email: 'seller@example.com',
                tax: '987-65-4321',
            },
            product: {
                id: '123456',
                tax: '5%',
                description: 'Wireless mouse',
            },
        });
 
        expect(mockQuery).toHaveBeenCalledWith(expect.any(String), [10]);
    });
 
    // Should throw "Order not found" when order does not exist
    test('should throw "Order not found" when order does not exist', async () => {
        mockQuery.mockResolvedValueOnce({ rowCount: 0, rows: [] });
 
        await expect(sellerService.getOrderDetails(999)).rejects.toThrow('Order not found');
    });
 
    // Should throw "Error fetching order details" when database query fails
    test('should throw "Error fetching order details" when database query fails', async () => {
        mockQuery.mockRejectedValueOnce(new Error('Database error'));
 
        await expect(sellerService.getOrderDetails(10)).rejects.toThrow('Error fetching order details: Database error');
    });
});