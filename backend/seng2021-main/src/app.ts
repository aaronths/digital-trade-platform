import express, { json, Request, Response, NextFunction } from "express";
import createError, { HttpError } from "http-errors";
import * as example from "./services/exampleService";
import dotenv from "dotenv";
import {
  isValidOrderId,
  deleteOrder,
  hasOrderStatus,
  getOrderDetails,
  createUBLDocument,
  createSellerResponse,
  getOrdersBySellerEmail,
  generateInvoice,
  getSellerRegisteredOrders,
  saveInvoice,
  viewInvoices,
  generateDespatchAdvice,
  getAllOrdersBySellerId,
  getSellerStats,
  saveDespatch,
  viewDespatches,
  getSellerActionOrders,
  getSellerFinanceStats,
} from "./services/sellerService";
import {
  cancelOrder,
  addOrderToDB,
  buyerAccept,
  getOrdersByBuyerEmail,
  checkProductIdToSellerId,
  getFullOrderDetails,
  addOrdertoDBv2,
  getAllOrdersByBuyerId,
  getBuyerStats,
  getBuyerActionOrders,
  getBuyerFinanceStats,
} from "./services/buyerService";
import pool from "./db";
import orderSchema from "./validation/orderSchema";
import { validateApiKey } from "./validation/security";
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const path = require("path");
import {
  findUserByBuyerId,
  findUserByEmail,
  findUserBySellerId,
  registerUser,
} from "./services/loginService";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cors from "cors";
import {
  createBuyer,
  findBuyerIdForUser,
  retrieveBuyerDetails,
} from "./services/buyerId";
import {
  createSeller,
  retrieveSellerDetails,
  findSellerIdForUser,
} from "./services/sellerId";
import orderSchemav2 from "./validation/orderSchemav2";

dotenv.config();

const app = express();
app.use(
  cors({
    origin: ["http://localhost:5173", "https://notuna-frontend.vercel.app"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "authorization"],
  })
);
const apiKeys = process.env.API_KEYS ? process.env.API_KEYS.split(",") : [];
const swaggerDocument = YAML.load(path.join(__dirname, "../swagger.yaml"));

// Middleware for accessing JSON
app.use(json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const PORT: number = parseInt(process.env.PORT || "3000");
const HOST: string = process.env.IP || "127.0.0.1";
const JWT_SECRET = process.env.JWT_SECRET!;

/*
==============================================================================
MAKE ALL ROUTES UNDER THIS LINE
==============================================================================
*/

app.get("/", (req, res) => {
  res.send(
    "Welcome to NoTuna's Order Creation API! To get started, check out our swagger file"
  );
});

// Example GET
app.get("/hello", (req, res) => {
  res.send("Hello, World!");
});

// Example POST
app.post("/submit", (req, res, next) => {
  const { name, email } = req.body;
  try {
    validateApiKey(req.headers.authorization, apiKeys);
    example.checkValidEmail(email);
  } catch (err) {
    if (err instanceof Error) {
      return next(err);
    }
    return next(createError(400, "Something went wrong"));
  }
  res.send(`Received data: Name = ${name}, Email = ${email}`);
});

// Shop Buyer Functions (Below)
app.put("/shop/buyer/:orderId/order-cancel", async (req, res, next) => {
  const orderId = parseInt(req.params.orderId, 10);

  if (isNaN(orderId)) {
    return next(createError(400, "Order cancellation failed: Invalid OrderId"));
  }

  try {
    validateApiKey(req.headers.authorization, apiKeys);

    const isCancelled = await cancelOrder(orderId);

    if (!isCancelled) {
      return next(
        createError(400, "Order cancellation failed: Invalid OrderId")
      );
    }

    res
      .status(200)
      .send({ message: `Order ${orderId} successfully cancelled` });
  } catch (err) {
    if (err instanceof Error) {
      return next(err);
    }
  }
});

app.post(
  "/shop/seller/:orderId/order-create-response",
  async (req, res, next) => {
    try {
      validateApiKey(req.headers.authorization, apiKeys);
      const orderId = parseInt(req.params.orderId as string);
      const response = req.body.response as string;
      await createSellerResponse(orderId, response);
      res.status(200).send({
        newResponse: response,
      });
    } catch (err) {
      if (err instanceof Error) {
        return next(createError(401, err.message));
      }
      return next(createError(401, "error"));
    }
  }
);

app.post("/shop/buyer/order", async (req, res, next) => {
  try {
    validateApiKey(req.headers.authorization, apiKeys);
    const { error, value } = orderSchema.validate(req.body);
    if (error) {
      return next(createError(400, error.details[0].message));
    }
    const orderId = await addOrderToDB(value);
    res.status(200).json({
      message: "Order accepted successfully",
      orderId: orderId,
    });
  } catch (err) {
    if (err instanceof Error) {
      return next(err);
    }
    return next(createError(400, "Order creation failed"));
  }
});

app.post("/v2/shop/buyer/order", async (req, res, next) => {
  try {
    validateApiKey(req.headers.authorization, apiKeys);

    const { error, value } = orderSchemav2.validate(req.body);
    if (error) {
      return next(createError(400, error.details[0].message));
    }

    const {
      productId,
      buyerId,
      sellerId,
      quantity,
      contractData,
      paymentDetails,
      deliveryAddress,
    } = req.body;

    await checkProductIdToSellerId(productId, sellerId);

    const details = await getFullOrderDetails(
      productId,
      buyerId,
      sellerId,
      quantity,
      contractData,
      paymentDetails,
      deliveryAddress
    );

    const orderId = await addOrdertoDBv2(details);

    res.status(200).json({
      message: "Order accepted successfully",
      orderId: orderId,
    });
  } catch (err) {
    if (err instanceof Error) {
      return next(err);
    }
    return next(createError(400, "Order creation failed"));
  }
});

app.delete(
  "/shop/seller/:orderId/order-cancel-receive",
  async (req, res, next) => {
    try {
      validateApiKey(req.headers.authorization, apiKeys);
      const orderId = parseInt(req.params.orderId, 10);

      if (isNaN(orderId)) {
        return next(
          createError(400, "Order cancellation failed: Invalid OrderId")
        );
      }

      const orderCheckQuery = `SELECT o_status FROM Orders WHERE order_id = $1`;
      const orderCheckResult = await pool.query(orderCheckQuery, [orderId]);

      if (orderCheckResult.rowCount === 0) {
        return next(createError(400, "Order not found"));
      }

      const currentStatus = orderCheckResult.rows[0].o_status;
      if (currentStatus !== "ORDER_CANCELLED") {
        return next(
          createError(400, "Order cannot be cancelled in its current state")
        );
      }

      await deleteOrder(orderId);
      res
        .status(200)
        .send({ message: `Order ${orderId} successfully cancelled` });
    } catch (err: unknown) {
      if ((err as HttpError).status === 401) {
        return next(err); // Propagate 401 error
      }
      return next(createError(400, (err as Error).message)); // Default to 400 for other errors
    }
  }
);

app.delete("/shop/seller/:orderId/order-reject", async (req, res, next) => {
  const { orderId } = req.params;

  try {
    const orderIdNumber = parseInt(orderId, 10);
    if (isNaN(orderIdNumber)) {
      throw new Error("Invalid Order ID");
    }

    // Check if the order exists and is in a valid state for rejection
    const orderCheckQuery = `SELECT o_status FROM Orders WHERE order_id = $1`;
    const orderCheckResult = await pool.query(orderCheckQuery, [orderIdNumber]);

    if (orderCheckResult.rowCount === 0) {
      throw new Error("Order not found");
    }

    const currentStatus = orderCheckResult.rows[0].o_status;
    if (currentStatus !== "PENDING_SELLER_REVIEW") {
      throw new Error("Order cannot be rejected in its current state");
    }

    // Update the order status to ORDER_REJECTED
    const updateQuery = `UPDATE Orders SET o_status = 'ORDER_REJECTED' WHERE order_id = $1 RETURNING *`;
    const updateResult = await pool.query(updateQuery, [orderIdNumber]);

    if (updateResult.rowCount === 0) {
      throw new Error("Failed to update order status");
    }

    // Return success response
    res.status(200).json({
      message: "Order rejected successfully",
      orderId: orderIdNumber,
    });
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "Invalid Order ID") {
        return next(createError(400, err.message));
      }
      if (err.message === "Order not found") {
        return next(createError(404, err.message));
      }
      if (err.message === "Order cannot be rejected in its current state") {
        return next(createError(400, err.message));
      }
      return next(createError(500, "Internal Server Error"));
    }
    return next(createError(500, "Internal Server Error"));
  }
});

app.put("/shop/buyer/:orderId/order-accept", async (req, res, next) => {
  const { orderId } = req.params;
  try {
    validateApiKey(req.headers.authorization, apiKeys);
    const orderIdNumber = parseInt(orderId, 10);
    if (isNaN(orderIdNumber)) {
      return next(createError(400, "Invalid Order ID"));
    }
    await buyerAccept(orderIdNumber);

    res.status(200).json({
      message: "Order accepted successfully",
      orderId: orderIdNumber,
    });
  } catch (err) {
    if (err instanceof Error) {
      return next(err);
    }
    return next(createError(400, "Order acceptance failed"));
  }
});

// PUT /shop/seller/:orderId/order-accept
app.put("/shop/seller/:orderId/order-accept", async (req, res, next) => {
  const { orderId } = req.params;

  try {
    const orderIdNumber = parseInt(orderId, 10);
    if (isNaN(orderIdNumber)) {
      throw new Error("Invalid Order ID");
    }

    // Check if the order exists and is in a valid state for acceptance
    const orderCheckQuery = `SELECT o_status FROM Orders WHERE order_id = $1`;
    const orderCheckResult = await pool.query(orderCheckQuery, [orderIdNumber]);

    if (orderCheckResult.rowCount === 0) {
      throw new Error("Order not found");
    }

    const currentStatus = orderCheckResult.rows[0].o_status;
    if (currentStatus !== "PENDING_SELLER_REVIEW") {
      throw new Error("Order cannot be accepted in its current state");
    }

    // Update the order status to SELLER_ORDER_ACCEPTED
    const updateQuery = `UPDATE Orders SET o_status = 'SELLER_ORDER_ACCEPTED' WHERE order_id = $1 RETURNING *`;
    const updateResult = await pool.query(updateQuery, [orderIdNumber]);

    if (updateResult.rowCount === 0) {
      throw new Error("Failed to update order status");
    }

    // Return success response
    res.status(200).json({
      message: "Order accepted successfully",
      orderId: orderIdNumber,
    });
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "Invalid Order ID") {
        return next(createError(400, err.message));
      }
      if (err.message === "Order not found") {
        return next(createError(404, err.message));
      }
      if (err.message === "Order cannot be accepted in its current state") {
        return next(createError(400, err.message));
      }
      return next(createError(500, "Internal Server Error"));
    }
    return next(createError(500, "Internal Server Error"));
  }
});

// PUT /shop/buyer/:orderId/order-change
app.put("/shop/buyer/:orderId/order-change", async (req, res, next) => {
  const { orderId } = req.params;
  const {
    buyerCompanyName,
    sellerCompanyName,
    productId,
    paymentDetails,
    deliveryAddress,
    contractData,
    quantity,
    price,
  } = req.body;

  try {
    validateApiKey(req.headers.authorization, apiKeys);

    const orderIdNumber = parseInt(orderId, 10);
    if (isNaN(orderIdNumber)) {
      throw new Error("Invalid Order ID");
    }

    // Check if the order exists
    const orderCheckQuery = `SELECT 1 FROM orders WHERE order_id = $1`;
    const orderCheckResult = await pool.query(orderCheckQuery, [orderIdNumber]);

    if (orderCheckResult.rowCount === 0) {
      throw new Error("Order not found"); // This should trigger a 404 error
    }

    // Validate required fields
    if (
      !buyerCompanyName ||
      !sellerCompanyName ||
      !productId ||
      !paymentDetails ||
      !deliveryAddress ||
      !contractData ||
      !quantity ||
      !price
    ) {
      throw new Error("Missing required fields");
    }

    // Update the order details and set status to PENDING_SELLER_REVIEW
    const updateQuery = `
            UPDATE orders
            SET 
                buyer = (SELECT b_id FROM buyers WHERE b_name = $1),
                seller = (SELECT s_id FROM sellers WHERE s_name = $2),
                product = (SELECT p_id FROM products WHERE p_id = $3),
                payment_details = $4,
                delivery_address = $5,
                contract_data = $6,
                quantity = $7,
                price = $8,
                o_status = 'PENDING_SELLER_REVIEW'
            WHERE order_id = $9
            RETURNING *;
        `;

    const values = [
      buyerCompanyName,
      sellerCompanyName,
      productId,
      paymentDetails,
      deliveryAddress,
      contractData,
      quantity,
      price,
      orderIdNumber,
    ];

    const updateResult = await pool.query(updateQuery, values);

    if (updateResult.rowCount === 0) {
      throw new Error("Failed to update order");
    }

    // Return success response
    res.status(200).json({
      message: "Order updated successfully",
      orderId: orderIdNumber,
    });
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "Invalid Order ID") {
        return next(createError(400, err.message));
      }
      if (err.message === "Order not found") {
        return next(createError(404, err.message)); // Ensure this is a 404 error
      }
      if (err.message === "Missing required fields") {
        return next(createError(400, err.message));
      }
    }
    // If the error is not one of the above, it will be caught by the global error handler
    next(err);
  }
});

app.put("/shop/seller/:orderId/order-register", async (req, res, next) => {
  try {
    validateApiKey(req.headers.authorization, apiKeys);

    const orderId = parseInt(req.params.orderId as string);

    // Checking if orderId is a valid number
    if (isNaN(orderId)) {
      return next(createError(400, "Invalid orderId"));
    }

    // Checking if orderId is a valid order in database
    // Via helper Function isValidOrderId
    const exists = await isValidOrderId(orderId);
    if (!exists) {
      return next(createError(400, "Order not found"));
    }

    // CONFIRM IF ORDER STATUS IS CORRECT
    const isAccepted = await hasOrderStatus(orderId, "SELLER_ORDER_ACCEPTED");
    if (!isAccepted) {
      return next(
        createError(403, "Order status is not SELLER_ORDER_ACCEPTED")
      );
    }

    // Fetch order details from the database
    const orderDetails = await getOrderDetails(orderId);

    // If order is not found, return an error
    if (!orderDetails) {
      return next(createError(404, "Order not found"));
    }

    // Create the UBL document from the order details
    const ublDocument = createUBLDocument(orderDetails);

    // Update the order status to "REGISTERED" in the database
    const updateQuery = `
            UPDATE Orders
            SET o_status = 'ORDER_REGISTERED'
            WHERE order_id = $1
        `;
    await pool.query(updateQuery, [orderId]);

    // Send the UBL XML in the response
    res.setHeader("Content-Type", "application/xml");
    res.status(200).send(ublDocument);
  } catch (err) {
    return next(createError(500, "Failed to register order"));
  }
});

app.put("/shop/seller/:orderId/order-add-detail", async (req, res, next) => {
  try {
    validateApiKey(req.headers.authorization, apiKeys);

    const orderId = parseInt(req.params.orderId as string);

    // Checking if orderId is a valid number
    if (isNaN(orderId)) {
      return next(createError(400, "Invalid orderId"));
    }

    const { responseText } = req.body;
    if (!responseText) {
      return next(createError(400, "Response text is required"));
    }

    // Checking if orderId is a valid order in database
    // Via helper Function isValidOrderId
    const exists = await isValidOrderId(orderId);
    if (!exists) {
      return next(createError(400, "Order not found"));
    }

    // Checking if order status is valid
    const isAccepted = await hasOrderStatus(orderId, "PENDING_SELLER_REVIEW");
    if (!isAccepted) {
      return next(
        createError(403, "Order status is not PENDING_SELLER_REVIEW")
      );
    }

    // Update the response text in the database
    // Update the response text in the database
    const updateQuery = `
            UPDATE Orders
            SET response = $1, 
                o_status = 'PENDING_BUYER_REVIEW'
            WHERE order_id = $2
            RETURNING response, o_status;
        `;

    const result = await pool.query(updateQuery, [responseText, orderId]);

    if (result.rowCount === 0) {
      return next(createError(500, "Failed to update order response"));
    }

    // Log changes for debugging
    console.log("Order Updated:", result.rows[0]);

    res.status(200).json({
      message: "Response updated successfully",
      orderId,
      responseText: result.rows[0].response,
      newStatus: result.rows[0].o_status,
    });
  } catch (err) {
    return next(createError(500, "Failed to add detail to order"));
  }
});

// Get all orders associated with seller
app.get("/shop/seller/orders", async (req, res, next) => {
  // returns array of order objects
  try {
    const sellerId = req.query.s_id as string;

    if (!sellerId) {
      return next(createError(400, "SellerId is required"));
    }

    const seller = await findUserBySellerId(sellerId);
    if (!seller) {
      return next(createError(404, "SellerId not found"));
    }

    const orders = await getAllOrdersBySellerId(sellerId);
    res.status(200).json({ orders });
  } catch (err) {
    if (err instanceof Error) {
      return next(err);
    }
    return next(createError(500, "Failed to retrieve seller orders"));
  }
});

// Get all orders associated with seller
app.get("/shop/seller/:sellerId/active-orders", async (req, res, next) => {
  // returns array of order objects
  try {
    const apiKey = req.headers.authorization;

    const email = req.query.email as string;

    if (!email) {
      return next(createError(400, "Seller email is required"));
    }

    // Check if email exists in the database
    const user = await findUserByEmail(email);
    if (!user) {
      return next(createError(404, "Seller email not found"));
    }

    const orders = await getOrdersBySellerEmail(email);
    res.status(200).json({ orders });
  } catch (err) {
    if (err instanceof Error) {
      return next(err);
    }
    return next(createError(500, "Failed to retrieve seller orders"));
  }
});

app.get(
  "/shop/seller/:sellerId/active-orders-action",
  async (req, res, next) => {
    try {
      validateApiKey(req.headers.authorization, apiKeys);
      const sellerId = parseInt(req.params.sellerId as string);
      const orders = await getSellerActionOrders(sellerId);
      console.log("orders");
      console.log(orders);
      res.status(200).json({ orders });
    } catch (err) {
      if (err instanceof Error) {
        return next(err);
      }
      return next(
        createError(500, "Failed to retrieve seller orders with action needed")
      );
    }
  }
);

// Get all orders associated with buyer
app.get("/shop/buyer/orders", async (req, res, next) => {
  // returns array of order objects
  try {
    const buyerId = req.query.b_id as string;

    if (!buyerId) {
      return next(createError(400, "BuyerId is required"));
    }

    const buyer = await findUserByBuyerId(buyerId);
    if (!buyer) {
      return next(createError(404, "BuyerId not found"));
    }

    const orders = await getAllOrdersByBuyerId(buyerId);
    res.status(200).json({ orders });
  } catch (err) {
    if (err instanceof Error) {
      return next(err);
    }
    return next(createError(500, "Failed to retrieve buyer orders"));
  }
});

// Get all active orders associated with buyer
app.get("/shop/buyer/:buyerId/active-orders", async (req, res, next) => {
  // returns array of order objects
  try {
    const email = req.query.email as string;

    if (!email) {
      return next(createError(400, "Buyer email is required"));
    }

    const buyer = await findUserByEmail(email);
    if (!buyer) {
      return next(createError(404, "Buyer email not found"));
    }

    const orders = await getOrdersByBuyerEmail(email);
    res.status(200).json({ orders });
  } catch (err) {
    if (err instanceof Error) {
      return next(err);
    }
    return next(createError(500, "Failed to retrieve buyer orders"));
  }
});

app.get("/shop/buyer/:buyerId/active-orders-action", async (req, res, next) => {
  // returns array of order objects with status associated with buyer action
  try {
    validateApiKey(req.headers.authorization, apiKeys);

    const buyerId = parseInt(req.params.buyerId as string);

    const orders = await getBuyerActionOrders(buyerId);
    res.status(200).json({ orders });
  } catch (err) {
    if (err instanceof Error) {
      return next(err);
    }
    return next(createError(500, "Failed to retrieve buyer orders"));
  }
});

app.get("/shop/products/allProduct-v2", async (req, res, next) => {
  try {
    validateApiKey(req.headers.authorization, apiKeys);
    const result = await pool.query("SELECT * FROM productsv2");
    res.status(200).json({ products: result.rows });
  } catch (err) {
    next(err);
  }
});

// Get order info from orderId
app.get("/shop/:orderId", async (req, res, next) => {
  // Returns object containing order information as JSON
  try {
    // Ensure API key present
    validateApiKey(req.headers.authorization, apiKeys);

    // Retrieve orderID
    const orderId = parseInt(req.params.orderId as string);

    // Checking if orderId is a valid number
    if (isNaN(orderId)) {
      return next(createError(400, "Invalid orderId"));
    }

    // Checking if orderId is a valid order in database
    // via helper Function isValidOrderId
    const exists = await isValidOrderId(orderId);
    if (!exists) {
      return next(createError(400, "Order not found"));
    }

    // CONFIRM IF ORDER STATUS IS CORRECT, Ensures order is registered
    const isAccepted = await hasOrderStatus(orderId, "ORDER_REGISTERED");
    if (!isAccepted) {
      return next(createError(403, "Order status is not ORDER_REGISTERED"));
    }

    const orderDetails = await getOrderDetails(orderId);
    if (!orderDetails) {
      return next(createError(404, "Order not found"));
    }

    res.status(200).json({
      OrderId: orderDetails.orderId,
      OrderDate: orderDetails.orderDate,
      Price: orderDetails.price,
      PaymentDetails: orderDetails.paymentDetails,
      Quantity: orderDetails.quantity,
      DeliveryAddress: orderDetails.deliveryAddress,
      ContractData: orderDetails.contractData,
      Response: orderDetails.response,
      Details: orderDetails.details,
      OrderStatus: orderDetails.orderStatus,
      Buyer: orderDetails.buyer,
      Seller: orderDetails.seller,
      Product: orderDetails.product,
    });
  } catch (err) {
    return next(createError(500, "Failed to retrieve order"));
  }
});

app.post("/shop/user/register", async (req, res, next) => {
  const { email, password, nameFirst, nameLast } = req.body;

  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    res.status(400).json({ message: "Email already in use" });
  }

  try {
    await registerUser(nameFirst, nameLast, email, password);
    res.status(200).json({ message: "User registered successfully" });
  } catch (err) {
    if (err instanceof Error) {
      return next(err);
    }
    return next(createError(400, "Something went wrong"));
  }
});

app.post("/shop/user/login", async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      res.status(400).json({ message: "Invalid email or password" });
    }

    const { namefirst, namelast, id, b_id, s_id } = user;

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "1h",
    });
    const sessionDetails = {
      email,
      namefirst,
      namelast,
      id,
      b_id,
      s_id,
      token,
    };
    res.status(200).json({ sessionDetails });
  } catch (err) {
    if (err instanceof Error) {
      return next(err);
    }
    return next(createError(400, "Something went wrong"));
  }
});

app.get("/shop/user/check-buyerId", async (req, res, next) => {
  try {
    const { userId } = req.query;

    console.log(`userId ${userId}`);
    if (!userId || isNaN(Number(userId))) {
      throw createError(400, "Invalid User ID");
    }

    const b_idFound = await findBuyerIdForUser(Number(userId));
    console.log(`b_idFound ${b_idFound}`);
    if (!b_idFound) {
      res.status(400).json({ message: "User has no b_Id" });
    }

    res.status(200).json({ message: "Buyer Id found" });
  } catch (err) {
    if (err instanceof Error) {
      return next(err);
    }
    return next(createError(400, "Something went wrong"));
  }
});

app.get("/shop/user/check-sellerId", async (req, res, next) => {
  try {
    const { userId } = req.query;

    if (!userId || isNaN(Number(userId))) {
      throw createError(400, "Invalid User ID");
    }

    const s_idFound = await findSellerIdForUser(Number(userId));

    if (!s_idFound) {
      res.status(400).json({ message: "User has no s_Id" });
    }

    res.status(200).json({ message: "Seller Id found" });
  } catch (err) {
    if (err instanceof Error) {
      return next(err);
    }
    return next(createError(400, "Something went wrong"));
  }
});

app.post("/shop/user/create-buyer", async (req, res, next) => {
  try {
    const {
      buyerCompanyName,
      buyerAddress,
      buyerPhoneNumber,
      buyerTax,
      buyerEmail,
      id,
    } = req.body;

    const buyerId = await createBuyer(
      {
        buyerCompanyName,
        buyerAddress,
        buyerPhoneNumber,
        buyerEmail,
        buyerTax,
      },
      id
    );
    res.status(200).json({ buyerId });
  } catch (err) {
    if (err instanceof Error) {
      return next(err);
    } else {
      return next(createError("Something went wrong"));
    }
  }
});

app.post("/shop/user/create-seller", async (req, res, next) => {
  try {
    const {
      sellerCompanyName,
      sellerAddress,
      sellerPhoneNumber,
      sellerTax,
      sellerEmail,
      id,
    } = req.body;

    const sellerId = await createSeller(
      {
        sellerCompanyName,
        sellerAddress,
        sellerPhoneNumber,
        sellerEmail,
        sellerTax,
      },
      id
    );
    res.status(200).json({ sellerId });
  } catch (err) {
    if (err instanceof Error) {
      return next(err);
    } else {
      return next(createError("Something went wrong"));
    }
  }
});

app.get("/shop/user/get-buyer-details", async (req, res, next) => {
  try {
    const { buyerId } = req.query;

    if (!buyerId || isNaN(Number(buyerId))) {
      throw createError(400, "Invalid buyer ID");
    }

    const buyerDetails = await retrieveBuyerDetails(Number(buyerId));
    res.status(200).json(buyerDetails);
  } catch (err) {
    if (err instanceof Error) {
      return next(err);
    }
    return next(createError("Something went wrong"));
  }
});

app.get("/shop/buyer/get-buyer-stats", async (req, res, next) => {
  try {
    const buyerId = req.query.b_id as string;

    const buyerStats = await getBuyerStats(buyerId);
    res.status(200).json(buyerStats);
  } catch (err) {
    if (err instanceof Error) {
      return next(err);
    }
    return next(createError("Something went wrong"));
  }
});

app.get("/shop/user/get-seller-details", async (req, res, next) => {
  try {
    const { sellerId } = req.query;

    if (!sellerId || isNaN(Number(sellerId))) {
      throw createError(400, "Invalid seller ID");
    }

    const sellerDetails = await retrieveSellerDetails(Number(sellerId));
    res.status(200).json(sellerDetails);
  } catch (err) {
    if (err instanceof Error) {
      return next(err);
    }
    return next(createError("Something went wrong"));
  }
});

app.get("/shop/seller/get-seller-stats", async (req, res, next) => {
  try {
    const sellerId = req.query.s_id as string;

    const sellerStats = await getSellerStats(sellerId);
    res.status(200).json(sellerStats);
  } catch (err) {
    if (err instanceof Error) {
      return next(err);
    }
    return next(createError("Something went wrong"));
  }
});

app.get("/shop/seller/get-seller-finance/:sellerid", async (req, res, next) => {
  try {
    const sellerId = parseInt(req.params.sellerid as string);

    const sellerStats = await getSellerFinanceStats(sellerId);
    res.status(200).json(sellerStats);
  } catch (err) {
    if (err instanceof Error) {
      return next(err);
    }
    return next(createError("Something went wrong"));
  }
});

app.get("/shop/seller/get-buyer-finance/:buyerid", async (req, res, next) => {
  try {
    const buyerId = parseInt(req.params.buyerid as string);

    const buyerStats = await getBuyerFinanceStats(buyerId);
    res.status(200).json(buyerStats);
  } catch (err) {
    if (err instanceof Error) {
      return next(err);
    }
    return next(createError("Something went wrong"));
  }
});

app.post("/shop/add-new-product-v2", async (req, res, next) => {
  try {
    const { name, price, tax, description } = req.body;

    if (!name || !price || !tax || !description) {
      throw createError(400, "All product fields must be valid and non-empty");
    }

    if (!name?.trim() || isNaN(price) || !tax?.trim() || !description?.trim()) {
      throw createError(400, "All product fields must be valid and non-empty");
    }

    const result = await pool.query(
      `INSERT INTO ProductsV2 (p2_name, p2_price, p2_tax, p2_desc)
         VALUES ($1, $2, $3, $4)
         RETURNING *;`,
      [name, price, tax, description]
    );

    res.status(200).json({
      message: "Product added successfully",
      product: result.rows[0],
    });
  } catch (err) {
    if (err instanceof Error) {
      return next(err);
    }
    return next(createError(500, "Something went wrong"));
  }
});

app.delete("/shop/delete-product-v2", async (req, res, next) => {
  try {
    const { id } = req.body;

    if (!id || isNaN(id)) {
      throw createError(400, "Valid product ID must be provided");
    }

    const result = await pool.query(
      `DELETE FROM ProductsV2 WHERE p2_id = $1 RETURNING *;`,
      [id]
    );

    if (result.rowCount === 0) {
      return next(createError(404, "Product not found"));
    }

    res.status(200).json({
      message: "Product deleted successfully",
      deletedProduct: result.rows[0],
    });
  } catch (err) {
    if (err instanceof Error) {
      return next(err);
    }
    return next(createError(500, "Something went wrong"));
  }
});

app.get("/shop/product-v2/:id", async (req, res, next) => {
  try {
    const productId = parseInt(req.params.id, 10);

    if (isNaN(productId)) {
      return next(createError(400, "Invalid product ID"));
    }

    const result = await pool.query(
      `SELECT * FROM ProductsV2 WHERE p2_id = $1`,
      [productId]
    );

    if (result.rowCount === 0) {
      return next(createError(404, "Product not found"));
    }

    res.status(200).json({ product: result.rows[0] });
  } catch (err) {
    return next(createError(500, "Failed to retrieve product"));
  }
});

// Product Route Addtion
app.post("/shop/:sellerId/add-new-product-v2", async (req, res, next) => {
  try {
    const sellerId = parseInt(req.params.sellerId as string);
    const { name, price, tax, description } = req.body;

    // Check if seller exists
    const sellerCheck = await pool.query(
      `SELECT * FROM Sellers WHERE s_id = $1`,
      [sellerId]
    );

    if (sellerCheck.rowCount === 0) {
      return next(createError(404, "Seller ID does not exist"));
    }

    if (isNaN(sellerId)) {
      throw createError(400, "Valid seller ID must be provided");
    }

    if (!name?.trim() || isNaN(price) || !tax?.trim() || !description?.trim()) {
      throw createError(400, "All product fields must be valid and non-empty");
    }

    const result = await pool.query(
      `INSERT INTO ProductsV2 (p2_name, p2_price, p2_tax, p2_desc, seller_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *;`,
      [name, price, tax, description, sellerId]
    );

    res.status(200).json({
      message: "Product added successfully",
      product: result.rows[0],
    });
  } catch (err) {
    if (err instanceof Error) {
      return next(err);
    }
    return next(createError(500, "Something went wrong"));
  }
});

app.delete("/shop/:sellerId/delete-product-v2", async (req, res, next) => {
  try {
    const sellerId = parseInt(req.params.sellerId as string);
    const { productId } = req.body;

    if (!sellerId || isNaN(sellerId)) {
      throw createError(400, "Valid seller ID must be provided");
    }

    if (!productId || isNaN(productId)) {
      throw createError(400, "Valid product ID must be provided");
    }

    const result = await pool.query(
      `DELETE FROM ProductsV2 WHERE p2_id = $1 AND seller_id = $2 RETURNING *;`,
      [productId, sellerId]
    );

    if (result.rowCount === 0) {
      return next(createError(404, "Product not found"));
    }

    res.status(200).json({
      message: "Product deleted successfully",
      deletedProduct: result.rows[0],
    });
  } catch (err) {
    if (err instanceof Error) {
      return next(err);
    }
    return next(createError(500, "Something went wrong"));
  }
});

app.get("/shop/product-v2/:sellerId/view-product", async (req, res, next) => {
  try {
    const sellerId = parseInt(req.params.sellerId as string);
    const productId = parseInt(req.query.productId as string);

    if (isNaN(sellerId)) {
      throw createError(400, "Valid seller ID must be provided");
    }

    if (isNaN(productId)) {
      throw createError(400, "Valid product ID must be provided");
    }

    // Check if seller exists
    const sellerResult = await pool.query(
      `SELECT * FROM Sellers WHERE s_id = $1`,
      [sellerId]
    );

    if (sellerResult.rowCount === 0) {
      return next(createError(404, "Seller ID not found"));
    }

    // Check if product belongs to this seller
    const productResult = await pool.query(
      `SELECT * FROM ProductsV2 WHERE p2_id = $1 AND seller_id = $2`,
      [productId, sellerId]
    );

    if (productResult.rowCount === 0) {
      return next(createError(404, "Product not found for this seller"));
    }

    res.status(200).json({ product: productResult.rows[0] });
  } catch (err) {
    return next(createError(500, "Failed to retrieve product"));
  }
});

app.get(
  "/shop/product-v2/:sellerId/view-all-products",
  async (req, res, next) => {
    try {
      const sellerId = parseInt(req.params.sellerId as string);

      if (isNaN(sellerId)) {
        throw createError(400, "Valid seller ID must be provided");
      }

      // Check if the seller exists
      const sellerResult = await pool.query(
        `SELECT * FROM Sellers WHERE s_id = $1`,
        [sellerId]
      );

      if (sellerResult.rowCount === 0) {
        return next(createError(404, "Seller ID not found"));
      }

      // Fetch all products for this seller
      const productResult = await pool.query(
        `SELECT * FROM ProductsV2 WHERE seller_id = $1`,
        [sellerId]
      );

      res.status(200).json({ products: productResult.rows });
    } catch (err) {
      return next(createError(500, "Failed to retrieve products"));
    }
  }
);

app.post("/shop/seller/generate-despatch/:orderId", async (req, res, next) => {
  try {
    validateApiKey(req.headers.authorization, apiKeys);
    const orderId = parseInt(req.params.orderId as string);
    const despatchAdvice = await generateDespatchAdvice(orderId);

    console.log("Generated Despatch Advice:", despatchAdvice);
    res.status(200).send({
      despatchAdvice,
    });
  } catch (err: any) {
    return next(createError(400, err.message));
  }
});

app.put("/shop/seller/save-despatch/:orderId", async (req, res, next) => {
  try {
    validateApiKey(req.headers.authorization, apiKeys);
    const orderId = parseInt(req.params.orderId as string);
    const sellerId = parseInt(req.query.sellerId as string);
    const despatchId = req.query.despatchId as string;
    await saveDespatch(orderId, sellerId, despatchId);
    res.status(200).send({
      message: "Despatch Saved Successfully",
      despatchId: despatchId,
    });
  } catch (err: any) {
    return next(createError(400, err.message));
  }
});

app.get("/shop/seller/view-despatch/:sellerId", async (req, res, next) => {
  try {
    validateApiKey(req.headers.authorization, apiKeys);
    const sellerId = parseInt(req.params.sellerId as string);
    const despatches = await viewDespatches(sellerId, "seller");
    res.status(200).send({ despatches });
  } catch (err: any) {
    return next(createError(400, err.message));
  }
});

app.get("/shop/buyer/view-despatch/:buyerId", async (req, res, next) => {
  try {
    validateApiKey(req.headers.authorization, apiKeys);
    const buyerId = parseInt(req.params.buyerId as string);
    const despatches = await viewDespatches(buyerId, "buyer");
    res.status(200).send({ despatches });
  } catch (err: any) {
    return next(createError(400, err.message));
  }
});

app.get("/shop/seller/orders/:sellerId", async (req, res, next) => {
  try {
    validateApiKey(req.headers.authorization, apiKeys);
    const sellerId = parseInt(req.params.sellerId as string);
    const orders = await getSellerRegisteredOrders(sellerId);

    res.status(200).send({ orders });
  } catch (err: any) {
    return next(createError(400, err.message));
  }
});

app.post("/shop/seller/generate-invoice/:orderId", async (req, res, next) => {
  try {
    validateApiKey(req.headers.authorization, apiKeys);
    const orderId = parseInt(req.params.orderId as string);
    const sellerId = parseInt(req.query.sellerId as string);
    const invoiceId = await generateInvoice(orderId, sellerId);
    res.status(200).send({
      message: "Invoice Generated Successfully",
      invoiceId: invoiceId,
    });
  } catch (err: any) {
    return next(createError(400, err.message));
  }
});

app.put("/shop/seller/save-invoice/:orderId", async (req, res, next) => {
  try {
    validateApiKey(req.headers.authorization, apiKeys);
    const orderId = parseInt(req.params.orderId as string);
    const sellerId = parseInt(req.query.sellerId as string);
    const invoiceId = req.query.invoiceId as string;
    await saveInvoice(orderId, sellerId, invoiceId);
    res.status(200).send({
      message: "Invoice Saved Successfully",
      invoiceId: invoiceId,
    });
  } catch (err: any) {
    return next(createError(400, err.message));
  }
});

app.get("/shop/seller/view-invoices/:sellerId", async (req, res, next) => {
  try {
    validateApiKey(req.headers.authorization, apiKeys);
    const sellerId = parseInt(req.params.sellerId as string);
    const invoices = await viewInvoices(sellerId, "seller");
    res.status(200).send({ invoices });
  } catch (err: any) {
    return next(createError(400, err.message));
  }
});

app.get("/shop/buyer/view-invoices/:buyerId", async (req, res, next) => {
  try {
    validateApiKey(req.headers.authorization, apiKeys);
    const buyerId = parseInt(req.params.buyerId as string);
    const invoices = await viewInvoices(buyerId, "buyer");
    res.status(200).send({ invoices });
  } catch (err: any) {
    return next(createError(400, err.message));
  }
});

// Messaging Routes Below

// app.post("/shop/messages/:senderEmail/send", async (req, res, next) => {
//   try {
//     const senderEmail = req.params.senderEmail;
//     const { receiverEmail, content } = req.body;

//     if (!receiverEmail || !content || !senderEmail) {
//       return next(createError(400, "Missing required fields"));
//     }

//     // Check if sender exists
//     const sender = await findUserByEmail(senderEmail);
//     if (!sender) {
//       return next(createError(404, "Sender email not found"));
//     }

//     // Check if receiver exists
//     const receiver = await findUserByEmail(receiverEmail);
//     if (!receiver) {
//       return next(createError(404, "Receiver email not found"));
//     }

//     // Insert message into DB
//     await pool.query(
//       `INSERT INTO MESSAGES (sender_email, reciever_email, content) VALUES ($1, $2, $3)`,
//       [senderEmail, receiverEmail, content]
//     );

//     res.status(200).json({ message: "Message sent successfully" });

//   } catch (err) {
//     console.error("Send message error:", err);
//     return next(createError(500, "Failed to send message"));
//   }
// });

app.post("/shop/messages/:senderEmail/send", async (req, res, next) => {
  try {
    const senderEmail = req.params.senderEmail;
    const { receiver_email, content } = req.body;

    if (!senderEmail || !receiver_email || !content?.trim()) {
      return next(createError(400, "Missing required fields"));
    }

    // Check if receiver exists
    const receiver = await findUserByEmail(receiver_email);
    if (!receiver) {
      return next(createError(404, "Receiver email not found"));
    }

    // Insert message into database
    const result = await pool.query(
      `INSERT INTO messages (sender_email, reciever_email, content)
       VALUES ($1, $2, $3)
       RETURNING *;`,
      [senderEmail, receiver_email, content]
    );

    res.status(200).json({
      message: "Message sent successfully",
      sent: result.rows[0],
    });
  } catch (err) {
    console.error("Send message error:", err);
    return next(createError(500, "Failed to send message"));
  }
});

app.get("/shop/messages/:email/view", async (req, res, next) => {
  try {
    const email = req.params.email;
    const type = req.query.type; // sent or received

    if (!email || (type !== "sent" && type !== "received")) {
      return next(createError(400, "Invalid email or query type"));
    }

    let result;
    if (type === "sent") {
      result = await pool.query(
        `SELECT * FROM Messages WHERE sender_email = $1 ORDER BY timestamp DESC`,
        [email]
      );
    } else {
      result = await pool.query(
        `SELECT * FROM Messages WHERE receiver_email = $1 ORDER BY timestamp DESC`,
        [email]
      );
    }

    res.status(200).json({ messages: result.rows });
  } catch (err: any) {
    console.error("Error retrieving messages:", err.message);
    return next(createError(500, "Failed to retrieve messages"));
  }
});

app.delete("/shop/messages/:messageId/delete", async (req, res, next) => {
  try {
    const messageId = parseInt(req.params.messageId as string);

    if (isNaN(messageId)) {
      return next(createError(400, "Invalid message ID"));
    }

    const result = await pool.query(
      `DELETE FROM Messages WHERE message_id = $1 RETURNING *`,
      [messageId]
    );

    if (result.rowCount === 0) {
      return next(createError(404, "Message not found"));
    }

    res.status(200).json({
      message: "Message deleted successfully",
      deleted: result.rows[0],
    });
  } catch (err) {
    return next(createError(500, "Failed to delete message"));
  }
});

app.put("/shop/messages/:messageId/edit", async (req, res, next) => {
  try {
    const messageId = parseInt(req.params.messageId as string);
    const { content } = req.body;

    if (isNaN(messageId) || !content || !content.trim()) {
      return next(
        createError(400, "Valid message ID and new content must be provided")
      );
    }

    const result = await pool.query(
      `UPDATE Messages 
       SET content = $1, timestamp = CURRENT_TIMESTAMP 
       WHERE message_id = $2 
       RETURNING *;`,
      [content.trim(), messageId]
    );

    if (result.rowCount === 0) {
      return next(createError(404, "Message not found"));
    }

    res.status(200).json({
      message: "Message updated successfully",
      updated: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    return next(createError(500, "Failed to update message"));
  }
});

app.get("/shop/messages/:userEmail/active-chats", async (req, res, next) => {
  try {
    const userEmail = req.params.userEmail;
    if (!userEmail) {
      return next(createError(404, "Email not found"));
    }

    const result = await pool.query(
      `SELECT DISTINCT reciever_email, sender_email
       FROM Messages
       WHERE reciever_email = $1 OR sender_email = $1`,
      [userEmail]
    );

    if (result.rows.length === 0) {
      return next(createError(404, "No active chats found"));
    }

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching active chats:", err);
    return next(createError(500, "Failed to fetch active chats.")); // Use next to pass error
  }
});

// Messaging Routes Above
/*
==============================================================================
MAKE ALL ROUTES ABOVE THIS LINE
==============================================================================
*/

app.use((req: Request, res: Response) => {
  const error = `
      Route not found - This could be because:
        0. You have defined routes below (not above) this middleware in server.ts
        1. You have not implemented the route ${req.method} ${req.path}
        2. There is a typo in either your test or server, e.g. /posts/list in one
           and, incorrectly, /post/list in the other
        3. You are using ts-node (instead of ts-node-dev) to start your server and
           have forgotten to manually restart to load the new changes
        4. You've forgotten a leading slash (/), e.g. you have posts/list instead
           of /posts/list in your server.ts or test file
    `;
  res.status(404).json({ error });
});

/* eslint-disable @typescript-eslint/no-unused-vars */
app.use(
  (err: HttpError, req: Request, res: Response, _next: NextFunction): void => {
    res.status(err.status || 500).json({
      message: err.message || "Internal Server Error",
      status: err.status || 500,
    });
  }
);

if (require.main === module) {
  app.listen(PORT, HOST, () => {
    console.log(`Server started on port ${PORT} at ${HOST}`);
  });
}

export default app;
