import { Pool} from 'pg';
const pool: Pool = require('../db');
import * as interfaces from '../validation/interfaces'
import createError from 'http-errors'


/*
==========================================================================
For /shop/buyer/order
==========================================================================
*/

export async function cancelOrder(orderId: number): Promise<boolean> {
    
    const updateQuery = `UPDATE orders SET o_status = $1 WHERE order_id = $2 RETURNING *`;
    const res = await pool.query(updateQuery, ['ORDER_CANCELLED', orderId]); 

    if (res.rowCount === 0) {
        return false;
    }
    return true;
}

export async function addOrderToDB(orderInfo: interfaces.OrderInfo) {
    const { // change and organise into objects 
        price,
        paymentDetails: payment_details,
        quantity,
        deliveryAddress: delivery_address,
        contractData: contract_data,
        buyerCompanyName,
        buyerAddress,
        buyerPhoneNumber,
        buyerEmail,
        buyerTax,
        sellerCompanyName,
        sellerAddress,
        sellerPhoneNumber,
        sellerEmail,
        sellerTax,
        // PRODUCT DETAILS
        productId,
        productTax,
        productDesc,
    } = orderInfo;

    // CREATE BUYER IF IT DOES NOT HAVE COMPLETE DUPLICATE

    const buyerInfo = {
        b_name: buyerCompanyName,
        b_address: buyerAddress,
        b_phone_no: buyerPhoneNumber,
        b_email: buyerEmail,
        b_tax: buyerTax
    }

    let query = `
    INSERT INTO buyers (b_name, b_address, b_phone_no, b_email, b_tax)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (b_name, b_address, b_phone_no, b_email, b_tax) DO NOTHING
    RETURNING b_id;
    `;

    let values = [
        buyerInfo.b_name,
        buyerInfo.b_address,
        buyerInfo.b_phone_no,
        buyerInfo.b_email,
        buyerInfo.b_tax
    ];

    let result = await pool.query(query, values);
    const b_id = result.rows.length > 0 ? result.rows[0].b_id : 
    (await pool.query(`SELECT b_id FROM buyers WHERE b_name = $1 AND b_address = $2 AND 
    b_phone_no = $3 AND b_email = $4 AND b_tax = $5`, values)).rows[0].b_id;

    // CREATE SELLER IF IT DOES NOT HAVE COMPLETE DUPLICATE

    const sellerInfo = {
        s_name: sellerCompanyName,
        s_address: sellerAddress,
        s_phone_no: sellerPhoneNumber,
        s_email: sellerEmail,
        s_tax: sellerTax
    }

    query = `
    INSERT INTO sellers (s_name, s_address, s_phone_no, s_email, s_tax)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (s_name, s_address, s_phone_no, s_email, s_tax) DO NOTHING
    RETURNING s_id;
    `;

    values = [
        sellerInfo.s_name,
        sellerInfo.s_address,
        sellerInfo.s_phone_no,
        sellerInfo.s_email,
        sellerInfo.s_tax
    ];

    result = await pool.query(query, values);
    const s_id = result.rows.length > 0 ? result.rows[0].s_id : 
    (await pool.query(`SELECT s_id FROM sellers WHERE s_name = $1 AND 
    s_address = $2 AND s_phone_no = $3 AND s_email = $4 AND s_tax = $5`, values)).rows[0].s_id;

     // CREATE PRODUCT IF IT DOES NOT HAVE COMPLETE DUPLICATE

    const productInfo = {
        p_id: productId,
        p_tax: productTax,
        p_desc: productDesc,
    }

    query = `
    INSERT INTO products (p_id, p_tax, p_desc)
    VALUES ($1, $2, $3)
    ON CONFLICT (p_id, p_tax, p_desc) DO NOTHING
    RETURNING p_id;
    `;

    values = [
    productInfo.p_id,
    productInfo.p_tax,
    productInfo.p_desc
    ];

    result = await pool.query(query, values);
    const p_id = result.rows.length > 0 ? result.rows[0].p_id : 
    (await pool.query(`SELECT p_id FROM products WHERE p_id = $1 AND 
    p_tax = $2 AND p_desc = $3`, values)).rows[0].p_id;

    values = [
        new Date().toISOString(),
        price,
        payment_details,
        quantity,
        delivery_address,
        contract_data,
        'PENDING_SELLER_REVIEW',
        b_id,
        s_id,
        p_id
    ]

    query = `
    INSERT INTO Orders (
    order_date, price, payment_details, quantity, 
    delivery_address, contract_data, o_status, buyer, seller, 
    product
    ) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING order_id;`;

    result = await pool.query(query, values);
    return result.rows[0].order_id;
}

export async function addOrdertoDBv2(orderInfo: interfaces.InfoWithIds) {
    const {
        price,
        paymentDetails: payment_details,
        quantity,
        deliveryAddress: delivery_address,
        contractData: contract_data,
        buyerId,
        sellerId,
        productId,
    } = orderInfo;

    const values = [
        new Date().toISOString(),
        price,
        payment_details,
        quantity,
        delivery_address,
        contract_data,
        'PENDING_SELLER_REVIEW',
        buyerId,
        sellerId,
        productId
    ];

    const query =  `
        INSERT INTO Orders (
            order_date, price, payment_details, quantity,
            delivery_address, contract_data, o_status, buyer, seller,
            product
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING order_id;
    `;
    const result = await pool.query(query, values);
    return result.rows[0].order_id;
}


export async function buyerAccept(orderId: number) {
    // Check if order number exists 
    // Check if order is in right status
    const orderCheckQuery = `SELECT o_status FROM Orders WHERE order_id = $1`;
        const orderCheckResult = await pool.query(orderCheckQuery, [orderId]);

        if (orderCheckResult.rowCount === 0) {
            throw createError(400, 'Order not found');
        }

        const currentStatus = orderCheckResult.rows[0].o_status;
        if (currentStatus !== 'PENDING_BUYER_REVIEW') {
            throw createError(400, 'Order cannot be accepted in its current state');
        }

        //Updates order status
        const updateQuery = `UPDATE Orders SET o_status = 'ORDER_ACCEPTED' WHERE order_id = $1 RETURNING *`;
        await pool.query(updateQuery, [orderId]);
}

export const getOrdersByBuyerEmail = async (email: string) => {
    const query = `
      SELECT o.order_id, o.order_date, o.price, o.quantity, o.o_status AS status,
             b.b_name AS buyer_name, s.s_name AS seller_name, p.p_desc AS product_description
      FROM Orders o
      JOIN Buyers b ON o.buyer = b.b_id
      JOIN Sellers s ON o.seller = s.s_id
      JOIN Products p ON o.product = p.p_id
      WHERE b.b_email = $1
        AND o.o_status != 'ORDER_REGISTERED'
      ORDER BY o.order_date DESC;
    `;
  
    const result = await pool.query(query, [email]);
    return result.rows;
};

export const getBuyerActionOrders = async (buyerId: number) => {
    const ordersResult = await pool.query(
        `SELECT o.order_id, o.order_date, s.s_name, o.o_status, p.p2_name, o.price, o.seller FROM Orders o 
        JOIN sellers s ON o.seller = s.s_id
        JOIN productsv2 p ON o.product = p.p2_id
        WHERE o.buyer = $1 AND o_status = 'PENDING_BUYER_REVIEW'
        ORDER BY o.order_id;`,
        [buyerId]
    );

    return ordersResult.rows;
  };


export const getAllOrdersByBuyerId = async (buyerId: string) => {
    const query = `
      SELECT o.order_id, o.order_date, o.price, o.quantity, o.o_status AS status,
             b.b_name AS buyer_name, s.s_name AS seller_name, p.p2_name AS product_name
      FROM Orders o
      JOIN Buyers b ON o.buyer = b.b_id
      JOIN Sellers s ON o.seller = s.s_id
      JOIN Productsv2 p ON o.product = p.p2_id
      WHERE b.b_id = $1
      ORDER BY o.order_date DESC;
    `;
  
    const result = await pool.query(query, [buyerId]);
    return result.rows;
};

export const checkProductIdToSellerId = async (productId: number, sellerId: number) => {
    const result = await pool.query (
        "SELECT 1 FROM productsv2 WHERE p2_id = $1 AND seller_id = $2 LIMIT 1", [productId, sellerId]
    );

    if (result.rowCount === 0 ){
        throw new Error("Product does not belong to the given seller")
    }
};

export const getFullOrderDetails = async (
    productId: number, 
    buyerId: number, 
    sellerId: number, 
    quantity: string,
    contractData: string,
    paymentDetails: string,
    deliveryAddress: string ) => {
    const productRes = await pool.query(
        `SELECT p2_id, p2_name, p2_price, p2_tax, p2_desc 
        FROM productsv2 
        WHERE p2_id = $1 AND seller_id = $2`, [productId, sellerId]
    );
    
    if (productRes.rowCount === 0) {
        throw new Error("Product not found for given seller");
    }


    const buyerRes = await pool.query(
        `SELECT b_id, b_name, b_address, b_phone_no, b_email, b_tax 
        FROM buyers
        WHERE b_id = $1`, [buyerId]
    );
    if (buyerRes.rowCount === 0) {
        throw new Error("Buyer not found");
    }

    const sellerRes = await pool.query(
        `SELECT s_id, s_name, s_address, s_phone_no, s_email, s_tax 
        FROM sellers
        WHERE s_id = $1`, [sellerId]
    );
    if (sellerRes.rowCount === 0) {
        throw new Error("Seller not found");
    }

    return {
        price: productRes.rows[0].p2_price,
        paymentDetails,
        quantity,
        deliveryAddress,
        contractData,

        buyerId: buyerRes.rows[0].b_id,
        buyerCompanyName: buyerRes.rows[0].buyerCompanyName,
        buyerAddress: buyerRes.rows[0].buyerAddress,
        buyerPhoneNumber: buyerRes.rows[0].buyerPhoneNumber,
        buyerEmail: buyerRes.rows[0].buyerEmail,
        buyerTax: buyerRes.rows[0].buyerTax,

        sellerId: sellerRes.rows[0].s_id,
        sellerCompanyName: sellerRes.rows[0].sellerCompanyName,
        sellerAddress: sellerRes.rows[0].sellerAddress,
        sellerPhoneNumber: sellerRes.rows[0].sellerPhoneNumber,
        sellerEmail: sellerRes.rows[0].sellerEmail,
        sellerTax: sellerRes.rows[0].sellerTax,

        productId: productRes.rows[0].p2_id,
        productTax: productRes.rows[0].p2_tax,
        productDesc: productRes.rows[0].p2_desc,
    }

}
export const getBuyerStats = async (buyerId: string) => {
    const buyerOrders = await pool.query(
        `SELECT o_status, order_date
        FROM orders
        WHERE buyer = $1`, 
        [buyerId]
    );

    if (buyerOrders.rowCount === 0) {
        throw new Error("buyerId not found");
    }

    const orders = buyerOrders.rows;

    const statusCounts: Record<string, number> = {
        "PENDING_SELLER_REVIEW": 0,
        "PENDING_BUYER_REVIEW": 0,
        "ORDER_REGISTERED": 0,
        "SELLER_ORDER_ACCEPTED": 0,
        "SELLER_ORDER_REJECTED": 0,
        "ORDER_CANCELLED": 0,
        "ORDER_ACCEPTED": 0,
        "ORDER_FULFILLED": 0,
    };

    const customStatusOrder: Record<string, number> = {
        "ORDER_FULFILLED": 1,
        "ORDER_CANCELLED": 2,
        "PENDING_BUYER_REVIEW": 3,
        "PENDING_SELLER_REVIEW": 4,
        "ORDER_ACCEPTED": 5,
        "SELLER_ORDER_ACCEPTED": 6,
        "ORDER_REGISTERED": 7,
        "SELLER_ORDER_REJECTED": 8,
    };

   
    for (const { o_status } of orders) {
        if (statusCounts[o_status] !== undefined) {
            statusCounts[o_status]++;
        }
    }

    const sortedOrders = orders
        .map(o => ({
            status: o.o_status,
            date: new Date(o.order_date).toISOString().split('T')[0],
        }))
        .sort((a, b) => {
            const statusA = customStatusOrder[a.status] ?? 999;
            const statusB = customStatusOrder[b.status] ?? 999;

            if (statusA !== statusB) {
                return statusA - statusB;
            }

            
            if (!a.date && !b.date) return 0;
            if (!a.date) return 1; 
            if (!b.date) return -1; 

            
            const dateA = new Date(a.date).toISOString().split('T')[0];
            const dateB = new Date(b.date).toISOString().split('T')[0];


            
            return dateA.localeCompare(dateB); 
        });

    return {
        totalOrders: orders.length,
        ...statusCounts,
        orders: sortedOrders,
    };
};


export async function getBuyerFinanceStats(buyerId: number) {
    const sellerOrders = await pool.query(
        `SELECT o_status, order_date, price
         FROM orders
         WHERE buyer = $1`, 
        [buyerId]
    );

    const orders = sellerOrders.rows;

    const statusCounts: Record<string, number> = {
        "PENDING_SELLER_REVIEW": 0,
        "PENDING_BUYER_REVIEW": 0,
        "ORDER_REGISTERED": 0,
        "SELLER_ORDER_ACCEPTED": 0,
        "SELLER_ORDER_REJECTED": 0,
        "ORDER_CANCELLED": 0,
        "ORDER_ACCEPTED": 0,
        "ORDER_FULFILLED": 0,
    };

    const statusRevenue: Record<string, number> = {
        "PENDING_SELLER_REVIEW": 0,
        "PENDING_BUYER_REVIEW": 0,
        "ORDER_REGISTERED": 0,
        "SELLER_ORDER_ACCEPTED": 0,
        "SELLER_ORDER_REJECTED": 0,
        "ORDER_CANCELLED": 0,
        "ORDER_ACCEPTED": 0,
        "ORDER_FULFILLED": 0,
    };

    const customStatusOrder: Record<string, number> = {
        "ORDER_FULFILLED": 1,
        "ORDER_CANCELLED": 2,
        "PENDING_BUYER_REVIEW": 3,
        "PENDING_SELLER_REVIEW": 4,
        "ORDER_ACCEPTED": 5,
        "SELLER_ORDER_ACCEPTED": 6,
        "ORDER_REGISTERED": 7,
        "SELLER_ORDER_REJECTED": 8,
    };

    for (const { o_status, price } of orders) {
        if (statusCounts[o_status] !== undefined) {
            statusCounts[o_status]++;
            statusRevenue[o_status] += Number(price) || 0;
        }
    }

    const sortedOrders = orders
        .map(o => ({
            status: o.o_status,
            date: new Date(o.order_date).toISOString().split('T')[0],
        }))
        .sort((a, b) => {
            const statusA = customStatusOrder[a.status] ?? 999;
            const statusB = customStatusOrder[b.status] ?? 999;

            if (statusA !== statusB) {
                return statusA - statusB;
            }

            if (!a.date && !b.date) return 0;
            if (!a.date) return 1;
            if (!b.date) return -1;

            return a.date.localeCompare(b.date);
        });

    return {
        totalOrders: orders.length,
        statusCounts,
        statusRevenue, // <-- Use this for bar chart
        orders: sortedOrders,
    };
}