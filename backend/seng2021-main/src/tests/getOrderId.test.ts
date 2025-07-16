// import app from '../app';
// import { Server } from 'http';
// import request from 'supertest';
// import * as sellerService from '../services/sellerService';

// // Mock the sellerService functions
// jest.mock('../services/sellerService', () => ({
//   isValidOrderId: jest.fn(),
//   hasOrderStatus: jest.fn(),
//   getOrderDetails: jest.fn(),
// }));

// const validApiKey = 'NoTuna';
// const validOrderId = 10;

// let server: Server;

// beforeAll(() => {
//   server = app.listen(3001, () => {
//     console.log('Test server started on port 3001');
//   });
// });

// afterAll(() => {
//   server.close(() => {
//     console.log('Test server closed');
//   });
// });

// beforeEach(() => {
//   jest.clearAllMocks();
// });

// describe('GET /shop/:orderId', () => {
//     test('should return 400 if orderId is not a number', async () => {
//       const response = await request(app)
//         .get('/shop/invalid')
//         .set('Authorization', validApiKey);
  
//       expect(response.status).toBe(400);
//       expect(response.body.message).toBe('Invalid orderId');
//     });
  
//     test('should return 400 if order is not found', async () => {
//       (sellerService.isValidOrderId as jest.Mock).mockResolvedValueOnce(false);
  
//       const response = await request(app)
//         .get(`/shop/${validOrderId}`)
//         .set('Authorization', validApiKey);
  
//       expect(response.status).toBe(400);
//       expect(response.body.message).toBe('Order not found');
//     });
  
//     test('should return 403 if order is not ORDER_REGISTERED', async () => {
//       (sellerService.isValidOrderId as jest.Mock).mockResolvedValueOnce(true);
//       (sellerService.hasOrderStatus as jest.Mock).mockResolvedValueOnce(false);
  
//       const response = await request(app)
//         .get(`/shop/${validOrderId}`)
//         .set('Authorization', validApiKey);
  
//       expect(response.status).toBe(403);
//       expect(response.body.message).toBe('Order status is not ORDER_REGISTERED');
//     });
  
    
//     test('should return 200 with order details in JSON', async () => {
//         (sellerService.isValidOrderId as jest.Mock).mockResolvedValueOnce(true);
//         (sellerService.hasOrderStatus as jest.Mock).mockResolvedValueOnce(true);
//         (sellerService.getOrderDetails as jest.Mock).mockResolvedValueOnce({
//           orderId: validOrderId,
//           orderDate: '2025-03-13T13:00:00.000Z',
//           price: 1500,
//           paymentDetails: 'Credit Card - ****1234',
//           quantity: 3,
//           deliveryAddress: '123 Main St, Apartment 4B, New York, NY 10001',
//           contractData: 'Contract reference number: ABC123456',
//           response: null,
//           details: null,
//           orderStatus: 'ORDER_REGISTERED',
//           buyer: {
//             name: 'Buyer Co.',
//             address: '123 Buyer St, New York, NY 10001',
//             phone: '+11234567890',
//             email: 'buyer@example.com',
//             tax: '123-45-6789',
//           },
//           seller: {
//             name: 'Seller Inc.',
//             address: '456 Seller Ave, Los Angeles, CA 90001',
//             phone: '+19876543210',
//             email: 'seller@example.com',
//             tax: '987-65-4321',
//           },
//           product: {
//             id: 123456,
//             tax: '5%',
//             description: 'Wireless mouse',
//           },
//         });
      
//         const response = await request(app)
//           .get(`/shop/${validOrderId}`)
//           .set('Authorization', validApiKey);
      
//         expect(response.status).toBe(200);
//         expect(response.body.orderId).toBe(validOrderId);
//         expect(response.body.buyer.name).toBe('Buyer Co.');
//         expect(response.body.product.id).toBe(123456);
//         expect(response.body.orderStatus).toBe('ORDER_REGISTERED');
//       });
//   });

import app from '../app';
import request from 'supertest';
import { Server } from 'http';
import * as sellerService from '../services/sellerService';

jest.mock('../services/sellerService', () => ({
  isValidOrderId: jest.fn(),
  hasOrderStatus: jest.fn(),
  getOrderDetails: jest.fn(),
}));

const validApiKey = 'NoTuna';
const validOrderId = 10;

let server: Server;

beforeAll((done) => {
  server = app.listen(3001, () => {
    console.log('Test server started on port 3001');
    done();
  });
});

afterAll((done) => {
  server.close(() => {
    console.log('Test server closed');
    done();
  });
});

describe('GET /shop/:orderId', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return 400 if orderId is not a number', async () => {
    const response = await request(app)
      .get('/shop/invalid')
      .set('Authorization', validApiKey);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Invalid orderId');
  });

  test('should return 400 if order is not found', async () => {
    (sellerService.isValidOrderId as jest.Mock).mockResolvedValueOnce(false);

    const response = await request(app)
      .get(`/shop/${validOrderId}`)
      .set('Authorization', validApiKey);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Order not found');
  });

  test('should return 403 if order is not ORDER_REGISTERED', async () => {
    (sellerService.isValidOrderId as jest.Mock).mockResolvedValueOnce(true);
    (sellerService.hasOrderStatus as jest.Mock).mockResolvedValueOnce(false);

    const response = await request(app)
      .get(`/shop/${validOrderId}`)
      .set('Authorization', validApiKey);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe('Order status is not ORDER_REGISTERED');
  });

  test('should return 200 with order details in JSON', async () => {
    (sellerService.isValidOrderId as jest.Mock).mockResolvedValueOnce(true);
    (sellerService.hasOrderStatus as jest.Mock).mockResolvedValueOnce(true);
    (sellerService.getOrderDetails as jest.Mock).mockResolvedValueOnce({
      orderId: validOrderId,
      orderDate: '2025-03-13T13:00:00.000Z',
      price: 1500,
      paymentDetails: 'Credit Card - ****1234',
      quantity: 3,
      deliveryAddress: '123 Main St, Apartment 4B, New York, NY 10001',
      contractData: 'Contract reference number: ABC123456',
      response: null,
      details: null,
      orderStatus: 'ORDER_REGISTERED',
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
        id: 123456,
        tax: '5%',
        description: 'Wireless mouse',
      },
    });
  
    const response = await request(app)
      .get(`/shop/${validOrderId}`)
      .set('Authorization', validApiKey);
  
    expect(response.status).toBe(200);
    expect(response.body.OrderId).toBe(validOrderId); // ✅ PascalCase
    expect(response.body.Buyer.name).toBe('Buyer Co.');
    expect(response.body.Product.id).toBe(123456);
    expect(response.body.OrderStatus).toBe('ORDER_REGISTERED');
  });
});
