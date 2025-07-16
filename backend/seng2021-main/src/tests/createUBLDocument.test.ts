import { createUBLDocument } from '../services/sellerService';
 
type OrderDetails = {
    orderId: number;
    orderDate: string;
    price: number;
    paymentDetails: string;
    quantity: number;
    deliveryAddress: string;
    contractData: string;
    response: string;
    details: string;
    orderStatus: string;
    buyer: {
        name: string;
        address: string;
        phone: string;
        email: string;
        tax: string;
    };
    seller: {
        name: string;
        address: string;
        phone: string;
        email: string;
        tax: string;
    };
    product: {
        id: number; // Ensuring this is a number
        tax: number; // Ensuring this is a number
        description: string;
    };
};

describe('createUBLDocument', () => {
    test('should generate valid UBL XML from order details', () => {
        const validOrderDetails: OrderDetails = {
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
                id: 123456, // Ensure this is a number
                tax: 5, // Changed from string ("5%") to number (5)
                description: 'Wireless mouse',
            },
        };

        const xmlOutput = createUBLDocument(validOrderDetails);

        expect(xmlOutput).toContain('<Invoice>');
        expect(xmlOutput).toContain('<Buyer>');
        expect(xmlOutput).toContain('<Product>');
        expect(xmlOutput).toContain('<Seller>');
        expect(xmlOutput).toContain('<OrderId>10</OrderId>');
        expect(xmlOutput).toContain('<OrderStatus>SELLER_ORDER_ACCEPTED</OrderStatus>');
    });

    test('should throw an error when order details are missing', () => {
        expect(() => createUBLDocument(undefined as unknown as OrderDetails)).toThrow();
    });

    test('should throw an error when buyer details are missing', () => {
        const invalidOrderDetails: Partial<OrderDetails> = {
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
            seller: {
                name: 'Seller Inc.',
                address: '456 Seller Ave, Los Angeles, CA 90001',
                phone: '+19876543210',
                email: 'seller@example.com',
                tax: '987-65-4321',
            },
            product: {
                id: 123456,
                tax: 5,
                description: 'Wireless mouse',
            },
        };

        expect(() => createUBLDocument(invalidOrderDetails as OrderDetails)).toThrow();
    });

    test('should throw an error when product details are missing', () => {
        const invalidOrderDetails: Partial<OrderDetails> = {
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
        };

        expect(() => createUBLDocument(invalidOrderDetails as OrderDetails)).toThrow();
    });

    test('should throw an error when seller details are missing', () => {
        const invalidOrderDetails: Partial<OrderDetails> = {
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
            product: {
                id: 123456,
                tax: 5,
                description: 'Wireless mouse',
            },
        };

        expect(() => createUBLDocument(invalidOrderDetails as OrderDetails)).toThrow();
    });
});