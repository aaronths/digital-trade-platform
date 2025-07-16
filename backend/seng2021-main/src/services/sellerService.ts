import { Pool } from "pg";
import { Builder } from "xml2js";
const pool: Pool = require("../db");

interface OrderDetails {
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
    id: number;
    tax: number;
    description: string;
  };
}

interface DespatchOrder {
  orderId: number;
  orderDate: Date;
  price: number;
  quantity: number;
  deliveryAddress: string;
  buyer: {
    name: string;
    address: string;
    phone: string;
    email: string;
    taxId: string;
  };
  seller: {
    name: string;
    address: string;
    phone: string;
    email: string;
    taxId: string;
  };
  product: {
    description: string;
    taxRate: string;
  };
}

interface DespatchRequestNew {
  OrderID: string;
  orderIssueDate: string;
  salesOrderId: string;
  DeliveryCustomerParty: {
    Party: {
      PartyIdentification: string;
      PostalAddress: {
        StreetName: string;
        CityName: string;
        PostalZone: string;
        CountrySubentity: string;
        AddressLine: string;
        Country: string;
      };
      PartyLegalEntity: {
        RegistrationName: string;
      };
    };
    DeliveryContact: {
      Name: string;
      Telephone: string;
      ElectronicMail: string;
    };
  };
  DespatchSupplierParty: {
    Party: {
      PartyIdentification: string;
      PostalAddress: {
        StreetName: string;
        CityName: string;
        PostalZone: string;
        CountrySubentity: string;
        AddressLine: string;
        Country: string;
      };
      PartyLegalEntity: {
        RegistrationName: string;
      };
    };
  };
  OrderLine: {
    Item: {
      Name: string;
    };
  };
}

export const isValidOrderId = async (orderId: number): Promise<boolean> => {
  const query = `SELECT 1 FROM orders WHERE order_id = $1`;
  const result = await pool.query(query, [orderId]);

  // Explicitly check if rowCount is null or undefined
  return (
    result.rowCount !== null &&
    result.rowCount !== undefined &&
    result.rowCount > 0
  );
};

// Checks if passed order status is true for order
export const hasOrderStatus = async (
  orderId: number,
  status: string
): Promise<boolean> => {
  const query = `SELECT 1 FROM orders WHERE order_id = $1 AND o_status = $2`;
  const result = await pool.query(query, [orderId, status]);

  // Ensure result and result.rowCount are defined and not null
  if (result && result.rowCount !== undefined && result.rowCount !== null) {
    return result.rowCount > 0; // Check if any rows are returned
  }

  // If result or rowCount is null/undefined, return false
  return false;
};

// Helper function make the UBL Document
export const getOrderDetails = async (
  orderId: number
): Promise<OrderDetails> => {
  try {
    // Query to get the order details along with buyer, seller, and product info
    const query = `
            SELECT 
                o.order_id, o.order_date, o.price, o.payment_details, o.quantity, 
                o.delivery_address, o.contract_data, o.response, o.details, o.o_status, 
                b.b_name AS buyer_name, b.b_address AS buyer_address, b.b_phone_no AS buyer_phone, 
                b.b_email AS buyer_email, b.b_tax AS buyer_tax, 
                s.s_name AS seller_name, s.s_address AS seller_address, s.s_phone_no AS seller_phone, 
                s.s_email AS seller_email, s.s_tax AS seller_tax, 
                p.p_id AS product_id, p.p_tax AS product_tax, p.p_desc AS product_desc
            FROM 
                Orders o
            LEFT JOIN Buyers b ON o.buyer = b.b_id
            LEFT JOIN Sellers s ON o.seller = s.s_id
            LEFT JOIN Products p ON o.product = p.p_id
            WHERE o.order_id = $1
        `;

    // Run the query with the given orderId
    const result = await pool.query(query, [orderId]);

    // Check if result is empty
    if (result.rowCount === 0) {
      throw new Error("Order not found");
    }

    // Extract order data from result
    const order = result.rows[0];

    const formattedOrderDate = order.order_date
      ? new Date(order.order_date).toISOString().split("T")[0]
      : "";

    // Return the structured data to be used for the UBL document
    return {
      orderId: order.order_id,
      //orderDate: order.order_date,
      orderDate: formattedOrderDate,
      price: order.price,
      paymentDetails: order.payment_details,
      quantity: order.quantity,
      deliveryAddress: order.delivery_address,
      contractData: order.contract_data,
      response: order.response,
      details: order.details,
      orderStatus: order.o_status,
      buyer: {
        name: order.buyer_name,
        address: order.buyer_address,
        phone: order.buyer_phone,
        email: order.buyer_email,
        tax: order.buyer_tax,
      },
      seller: {
        name: order.seller_name,
        address: order.seller_address,
        phone: order.seller_phone,
        email: order.seller_email,
        tax: order.seller_tax,
      },
      product: {
        id: order.product_id,
        tax: order.product_tax,
        description: order.product_desc,
      },
    };
  } catch (error) {
    throw new Error(
      `Error fetching order details: ${(error as Error).message}`
    );
  }
};

export const createUBLDocument = (orderDetails: OrderDetails): string => {
  const builder = new Builder({
    xmldec: { version: "1.0", encoding: "UTF-8" },
    renderOpts: { pretty: true, indent: "  ", newline: "\n" }, // Ensures pretty printing
  });

  // Build the UBL XML structure
  const ublData = {
    Invoice: {
      OrderDetails: {
        Buyer: {
          Name: orderDetails.buyer.name,
          Address: orderDetails.buyer.address,
          Phone: orderDetails.buyer.phone,
          Email: orderDetails.buyer.email,
          Tax: orderDetails.buyer.tax,
        },
        Product: {
          Id: orderDetails.product.id,
          Description: orderDetails.product.description,
          Tax: orderDetails.product.tax,
        },
        OrderId: orderDetails.orderId,
        OrderDate: orderDetails.orderDate || "", // yyyy-mm-dd
        Price: orderDetails.price,
        PaymentDetails: orderDetails.paymentDetails,
        Quantity: orderDetails.quantity,
        DeliveryAddress: orderDetails.deliveryAddress,
        ContractData: orderDetails.contractData,
        Response: orderDetails.response,
        Details: orderDetails.details,
        OrderStatus: orderDetails.orderStatus,
        Seller: {
          Name: orderDetails.seller.name,
          Address: orderDetails.seller.address,
          Phone: orderDetails.seller.phone,
          Email: orderDetails.seller.email,
          Tax: orderDetails.seller.tax,
        },
      },
    },
  };

  // Convert the JavaScript object into a pretty-printed XML string
  return builder.buildObject(ublData);
};

// services/sellerService.ts or a new service file
export const getOrdersBySellerEmail = async (email: string) => {
  const sellerResult = await pool.query(
    `SELECT s_id FROM Sellers WHERE s_email = $1`,
    [email]
  );

  if (sellerResult.rowCount === 0) {
    throw new Error("Seller not found");
  }

  const sellerId = sellerResult.rows[0].s_id;

  const ordersResult = await pool.query(
    `SELECT * FROM Orders WHERE seller = $1 AND o_status != 'ORDER_REGISTERED'`,
    [sellerId]
  );

  return ordersResult.rows;
};

export const getSellerActionOrders = async (sellerId: number) => {
  const ordersResult = await pool.query(
    `SELECT o.order_id, o.order_date, b.b_name, o.o_status, p.p2_name, o.price, o.seller FROM Orders o 
        JOIN buyers b ON o.buyer = b.b_id
        JOIN productsv2 p ON o.product = p.p2_id
        WHERE o.seller = $1 AND o_status = 'PENDING_SELLER_REVIEW'
        ORDER BY o.order_id;`,
    [sellerId]
  );

  return ordersResult.rows;
};

export const getAllOrdersBySellerId = async (sellerId: string) => {
  const query = `
      SELECT o.order_id, o.order_date, o.price, o.quantity, o.o_status AS status,
             b.b_name AS buyer_name, s.s_name AS seller_name, p.p2_name AS product_name
      FROM Orders o
      JOIN Buyers b ON o.buyer = b.b_id
      JOIN Sellers s ON o.seller = s.s_id
      JOIN Productsv2 p ON o.product = p.p2_id
      WHERE s.s_id = $1
      ORDER BY o.order_date DESC;
    `;

  const result = await pool.query(query, [sellerId]);
  return result.rows;
};

export const getSellerStats = async (sellrId: string) => {
  const sellerOrders = await pool.query(
    `SELECT o_status, order_date
        FROM orders
        WHERE seller = $1`,
    [sellrId]
  );

  if (sellerOrders.rowCount === 0) {
    throw new Error("sellrId not found");
  }

  const orders = sellerOrders.rows;

  const statusCounts: Record<string, number> = {
    PENDING_SELLER_REVIEW: 0,
    PENDING_BUYER_REVIEW: 0,
    ORDER_REGISTERED: 0,
    SELLER_ORDER_ACCEPTED: 0,
    SELLER_ORDER_REJECTED: 0,
    ORDER_CANCELLED: 0,
    ORDER_ACCEPTED: 0,
    ORDER_FULFILLED: 0,
  };

  const customStatusOrder: Record<string, number> = {
    ORDER_FULFILLED: 1,
    ORDER_CANCELLED: 2,
    PENDING_BUYER_REVIEW: 3,
    PENDING_SELLER_REVIEW: 4,
    ORDER_ACCEPTED: 5,
    SELLER_ORDER_ACCEPTED: 6,
    ORDER_REGISTERED: 7,
    SELLER_ORDER_REJECTED: 8,
  };

  for (const { o_status } of orders) {
    if (statusCounts[o_status] !== undefined) {
      statusCounts[o_status]++;
    }
  }

  const sortedOrders = orders
    .map((o) => ({
      status: o.o_status,
      date: new Date(o.order_date).toISOString().split("T")[0],
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

      const dateA = new Date(a.date).toISOString().split("T")[0];
      const dateB = new Date(b.date).toISOString().split("T")[0];

      return dateA.localeCompare(dateB);
    });

  return {
    totalOrders: orders.length,
    ...statusCounts,
    orders: sortedOrders,
  };
};

/*
==========================================================================
For /shop/seller/{orderId}/order-create-response
==========================================================================
*/

export async function createSellerResponse(
  orderId: number,
  newResponse: string
) {
  if (!orderId || isNaN(orderId)) {
    throw new Error("OrderId is empty or invalid");
  }

  // Checking whether the order id exists
  const checkQuery = "SELECT 1 FROM Orders WHERE order_id = $1";
  const checkResult = await pool.query(checkQuery, [orderId]);
  if (checkResult.rowCount === 0) {
    throw new Error("OrderId is empty or invalid");
  }

  // Getting the old response to concatenate the new response to
  const query = "SELECT response FROM Orders WHERE order_id = $1";
  const result = await pool.query(query, [orderId]);
  const oldResponse = result.rows[0].response || "";

  const timestamp = new Date().toISOString();

  const updatedResponse = `${oldResponse}\n${timestamp}\n${newResponse}`;

  // Update the response field
  const updateResponseQuery =
    "UPDATE Orders SET response = $1 WHERE order_id = $2";
  await pool.query(updateResponseQuery, [updatedResponse, orderId]);

  // Update the order status
  const updateStatusQuery =
    "UPDATE Orders SET o_status = $1 WHERE order_id = $2";
  await pool.query(updateStatusQuery, ["PENDING_BUYER_REVIEW", orderId]);
}

export async function deleteOrder(orderId: number) {
  const deleteQuery = "DELETE FROM Orders WHERE order_id = $1";
  const result = await pool.query(deleteQuery, [orderId]);

  if (result.rowCount === 0) {
    throw new Error("Order not found");
  }
}
/*
==========================================================================
For /shop/seller/generate-invoice/{orderId}
==========================================================================
*/
interface orderCreateObject {
  OrderId: number;
  OrderDate: Date;
  Price: number;
  PaymentDetails: string;
  Quantity: number;
  DeliveryAddress: string;
  ContractData: string;
  Response: string;
  Details: string;
  OrderStatus: string;
  Buyer: {
    name: string;
    tax: string;
    phone: string;
    email: string;
    address: string;
  };
  Seller: {
    name: string;
    tax: string;
    phone: string;
    email: string;
    address: string;
  };
  Product: { tax: string; description: string };
}

// helper function for generateInvoice
function convertToInvoiceXML(creationXML: orderCreateObject): string {
  const buyerName = creationXML.Buyer.name;
  const buyerTax = creationXML.Buyer.tax;

  const sellerName = creationXML.Seller.name;
  const sellerTax = creationXML.Seller.tax;

  const productTax = parseInt(creationXML.Product.tax);
  const productDesc = creationXML.Product.description;

  const totalTax = creationXML.Price * (productTax / 100);
  const productPrice = creationXML.Price / creationXML.Quantity;
  const productName = creationXML.Product.description;

  const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
<Order xmlns="urn:oasis:names:specification:ubl:schema:xsd:Order-2"
       xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
       xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
    <cbc:ID>PO-${creationXML.OrderId}</cbc:ID>
    <cbc:IssueDate>${creationXML.OrderDate}</cbc:IssueDate>
    <cbc:OrderTypeCode>220</cbc:OrderTypeCode>
    <cbc:DocumentCurrencyCode>AUD</cbc:DocumentCurrencyCode>
    <cac:BuyerCustomerParty>
        <cac:Party>
            <cac:PartyName>
                <cbc:Name>${buyerName}</cbc:Name>
            </cac:PartyName>
            <cac:PartyTaxScheme>
                <cbc:CompanyID>${buyerTax}</cbc:CompanyID>
                <cac:TaxScheme>
                    <cbc:ID>VAT</cbc:ID>
                </cac:TaxScheme>
            </cac:PartyTaxScheme>
        </cac:Party>
    </cac:BuyerCustomerParty>
    <cac:SellerSupplierParty>
        <cac:Party>
            <cac:PartyName>
                <cbc:Name>${sellerName}</cbc:Name>
            </cac:PartyName>
            <cac:PartyTaxScheme>
                <cbc:CompanyID>${sellerTax}</cbc:CompanyID>
                <cac:TaxScheme>
                    <cbc:ID>VAT</cbc:ID>
                </cac:TaxScheme>
            </cac:PartyTaxScheme>
        </cac:Party>
    </cac:SellerSupplierParty>
    <cac:OrderLine>
        <cbc:ID>1</cbc:ID>
        <cac:LineItem>
            <cbc:ID>1</cbc:ID>
            <cbc:Quantity unitCode="EA">${creationXML.Quantity}</cbc:Quantity>
            <cbc:LineExtensionAmount currencyID="AUD">${creationXML.Price}</cbc:LineExtensionAmount>
            <cac:Item>
                <cbc:Description>${productDesc}</cbc:Description>
                <cbc:Name>${productName}</cbc:Name>
            </cac:Item>
            <cac:Price>
                <cbc:PriceAmount currencyID="AUD">${productPrice}</cbc:PriceAmount>
            </cac:Price>
            <cac:TaxTotal>
                <cbc:TaxAmount currencyID="AUD">${totalTax}</cbc:TaxAmount>
                <cac:TaxSubtotal>
                    <cbc:TaxableAmount currencyID="AUD">${creationXML.Price}</cbc:TaxableAmount>
                    <cbc:TaxAmount currencyID="AUD">${totalTax}</cbc:TaxAmount>
                    <cac:TaxCategory>
                        <cbc:ID>S</cbc:ID>
                        <cbc:Percent>${productTax}</cbc:Percent>
                        <cac:TaxScheme>
                            <cbc:ID>VAT</cbc:ID>
                        </cac:TaxScheme>
                    </cac:TaxCategory>
                </cac:TaxSubtotal>
            </cac:TaxTotal>
        </cac:LineItem>
    </cac:OrderLine>
</Order> `;
  return xmlString;
}

//helper function for generateInvoice
async function fetchOrder(orderId: number): Promise<orderCreateObject> {
  const url = "https://seng2021-notuna-order.vercel.app/shop/" + orderId;
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: "SENG2021",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error("Failed to fetch order details : " + error);
  }
}

//helper function for generateInvoice
async function generateInvoiceAPI(
  orderId: number,
  xmlInvoice: string
): Promise<string> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/xml",
    };
    if (process.env.INVOICE_API_KEY)
      headers["X-API-Key"] = process.env.INVOICE_API_KEY;
    if (process.env.INVOICE_USER_EMAIL)
      headers["X-User-Email"] = process.env.INVOICE_USER_EMAIL;
    const response = await fetch(
      "http://guard-ubl-api.us-east-1.elasticbeanstalk.com/api/invoices/generate",
      {
        method: "POST",
        headers,
        body: xmlInvoice,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const responseData = await response.json();
    return responseData.invoiceId;
  } catch (error) {
    throw new Error("Failed to generate invoice : " + error);
  }
}

export async function generateInvoice(
  orderId: number,
  sellerId: number
): Promise<string> {
  if (!orderId || isNaN(orderId)) {
    throw new Error("OrderId is empty or invalid");
  }

  if (!sellerId || isNaN(sellerId)) {
    throw new Error("SellerId is empty or invalid");
  }

  const isOrderValidQuery =
    "SELECT seller, invoice_id, o_status FROM Orders WHERE order_id = $1";
  const isOrderValidRes = await pool.query(isOrderValidQuery, [orderId]);
  if (isOrderValidRes.rowCount == 0) {
    throw new Error("OrderId does not exist");
  } else if (parseInt(isOrderValidRes.rows[0].seller) != sellerId) {
    throw new Error("You do not own this order");
  } else if (isOrderValidRes.rows[0].o_status !== "ORDER_REGISTERED") {
    throw new Error("Order has not been registered");
  } else if (isOrderValidRes.rows[0].invoice_id !== null) {
    throw new Error("Invoice already saved");
  }

  const orderCreationDetails = await fetchOrder(orderId);
  const xmlInvoice = convertToInvoiceXML(orderCreationDetails);
  const invoiceId = await generateInvoiceAPI(orderId, xmlInvoice);
  return invoiceId;
}

export async function getSellerRegisteredOrders(sellerId: number) {
  const status = "ORDER_REGISTERED";
  const checkQuery =
    "SELECT order_id FROM Orders WHERE seller = $1 AND o_status = $2";
  const checkResult = await pool.query(checkQuery, [sellerId, status]);
  const orderIds = checkResult.rows.map((row) => row.order_id);
  return orderIds;
}

export async function saveInvoice(
  orderId: number,
  sellerId: number,
  invoiceId: string
) {
  if (!orderId || isNaN(orderId)) {
    throw new Error("OrderId is empty or invalid");
  }

  if (!sellerId || isNaN(sellerId)) {
    throw new Error("SellerId is empty or invalid");
  }

  if (!invoiceId) {
    throw new Error("invoiceId is empty");
  }

  const isOrderValidQuery =
    "SELECT seller, invoice_id, o_status FROM Orders WHERE order_id = $1";
  const isOrderValidRes = await pool.query(isOrderValidQuery, [orderId]);
  if (isOrderValidRes.rowCount == 0) {
    throw new Error("OrderId does not exist");
  } else if (parseInt(isOrderValidRes.rows[0].seller) != sellerId) {
    throw new Error("You do not own this order");
  } else if (isOrderValidRes.rows[0].o_status !== "ORDER_REGISTERED") {
    throw new Error("Order has not been registered");
  } else if (isOrderValidRes.rows[0].invoice_id !== null) {
    throw new Error("Invoice already saved");
  }

  const SaveInvoiceQuery =
    "UPDATE Orders SET invoice_id = $1 WHERE order_id = $2";
  await pool.query(SaveInvoiceQuery, [invoiceId, orderId]);
}

export async function viewInvoices(
  buyerOrSellerId: number,
  BuyerOrSeller: string
) {
  if (!buyerOrSellerId || isNaN(buyerOrSellerId)) {
    throw new Error("Buyer or Seller ID is empty or invalid");
  }
  let InvoiceListQuery: string;
  if (BuyerOrSeller === "seller") {
    InvoiceListQuery = `SELECT o.order_id, o.order_date, b.b_name, o.o_status, p.p2_name, o.price, o.invoice_id, o.seller FROM Orders o 
        JOIN buyers b ON o.buyer = b.b_id
        JOIN productsv2 p ON o.product = p.p2_id
        WHERE o.seller = $1 AND invoice_id IS NOT NULL
        ORDER BY o.order_id;`;
  } else {
    InvoiceListQuery = `SELECT o.order_id, o.order_date, s.s_name, o.o_status, p.p2_name, o.price, o.invoice_id, o.buyer FROM Orders o 
        JOIN sellers s ON o.seller = s.s_id
        JOIN productsv2 p ON o.product = p.p2_id
        WHERE o.buyer = $1 AND invoice_id IS NOT NULL
        ORDER BY o.order_id;`;
  }

  const InvoiceListRes = await pool.query(InvoiceListQuery, [buyerOrSellerId]);
  return InvoiceListRes.rows;
}

/*
==========================================================================
For /shop/seller/generate-despatch/{orderId}
==========================================================================
*/

async function callNewDespatchAPI(
  despatchData: DespatchRequestNew
): Promise<object> {
  const response = await fetch(
    "https://sbu6etysvc.execute-api.us-east-1.amazonaws.com/v2/despatch",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(despatchData),
    }
  );

  const responseBody = await response.json();

  if (!response.ok) {
    throw new Error(`Despatch API error: ${response.statusText}`);
  }

  return responseBody;
}

function convertToDespatchOrder(original: orderCreateObject): DespatchOrder {
  return {
    orderId: original.OrderId,
    orderDate: new Date(original.OrderDate), // Convert to Date object
    price: original.Price,
    quantity: original.Quantity,
    deliveryAddress: original.DeliveryAddress,
    buyer: {
      name: original.Buyer.name,
      address: original.Buyer.address || original.DeliveryAddress,
      phone: original.Buyer.phone,
      email: original.Buyer.email,
      taxId: original.Buyer.tax,
    },
    seller: {
      name: original.Seller.name,
      address: original.Seller.address,
      phone: original.Seller.phone,
      email: original.Seller.email,
      taxId: original.Seller.tax,
    },
    product: {
      description: original.Product.description,
      taxRate: original.Product.tax,
    },
  };
}

function transformToNewDespatchFormat(
  order: DespatchOrder
): DespatchRequestNew {
  const parseAddress = (address: string) => {
    const parts = address.split(",").map((p) => p.trim());
    return {
      street: parts[0] || "Unknown Street",
      city: parts[1] || "Unknown City",
      postalCode: parts[2] || "0000",
    };
  };

  const deliveryAddress = parseAddress(order.deliveryAddress);
  const sellerAddress = parseAddress(order.seller.address);

  // Debug log to verify contact info
  console.log(
    "Contact Info - Phone:",
    order.buyer.phone,
    "Email:",
    order.buyer.email
  );

  return {
    OrderID: order.orderId.toString(),
    orderIssueDate: order.orderDate.toISOString().split("T")[0],
    salesOrderId: `SO-${order.orderId}`,
    DeliveryCustomerParty: {
      Party: {
        PartyIdentification: order.buyer.taxId,
        PostalAddress: {
          StreetName: deliveryAddress.street,
          CityName: "See AddressLine",
          PostalZone: "See AddressLine",
          CountrySubentity: "New South Wales",
          AddressLine: order.deliveryAddress,
          Country: "Australia",
        },
        PartyLegalEntity: {
          RegistrationName: order.buyer.name,
        },
      },
      DeliveryContact: {
        Name: order.buyer.name,
        Telephone: order.buyer.phone,
        ElectronicMail: order.buyer.email,
      },
    },
    DespatchSupplierParty: {
      Party: {
        PartyIdentification: order.seller.taxId,
        PostalAddress: {
          StreetName: sellerAddress.street,
          CityName: "See AddressLine",
          PostalZone: "See AddressLine",
          CountrySubentity: "New South Wales",
          AddressLine: order.seller.address,
          Country: "Australia",
        },
        PartyLegalEntity: {
          RegistrationName: order.seller.name,
        },
      },
    },
    OrderLine: {
      Item: {
        Name: order.product.description,
      },
    },
  };
}

export async function generateDespatchAdvice(orderId: number): Promise<object> {
  if (!orderId || isNaN(orderId)) {
    throw new Error("Invalid order ID");
  }

  // Validate order exists
  const orderExists = await pool.query(
    "SELECT 1 FROM orders WHERE order_id = $1",
    [orderId]
  );
  if (orderExists.rowCount === 0) {
    throw new Error("Order not found");
  }

  // Check order status
  const statusResult = await pool.query(
    "SELECT o_status FROM orders WHERE order_id = $1",
    [orderId]
  );
  if (statusResult.rows[0].o_status !== "ORDER_REGISTERED") {
    throw new Error(`Order must be in REGISTERED status`);
  }

  // Fetch and process order
  const originalOrder = await fetchOrder(orderId);
  console.log("Original order data:", originalOrder); // Debug log

  const despatchOrder = convertToDespatchOrder(originalOrder);
  const despatchData = transformToNewDespatchFormat(despatchOrder);

  console.log("Despatch payload:", despatchData); // Debug log
  return await callNewDespatchAPI(despatchData);
}

export async function saveDespatch(
  orderId: number,
  sellerId: number,
  despatchId: string
) {
  if (!orderId || isNaN(orderId)) {
    throw new Error("OrderId is empty or invalid");
  }

  if (!sellerId || isNaN(sellerId)) {
    throw new Error("SellerId is empty or invalid");
  }

  if (!despatchId) {
    throw new Error("despatchId is empty");
  }

  const isOrderValidQuery =
    "SELECT seller, despatch_id, o_status FROM Orders WHERE order_id = $1";
  const isOrderValidRes = await pool.query(isOrderValidQuery, [orderId]);
  if (isOrderValidRes.rowCount == 0) {
    throw new Error("OrderId does not exist");
  } else if (parseInt(isOrderValidRes.rows[0].seller) != sellerId) {
    throw new Error("You do not own this order");
  } else if (isOrderValidRes.rows[0].o_status !== "ORDER_REGISTERED") {
    throw new Error("Order has not been registered");
  } else if (isOrderValidRes.rows[0].despatch_id !== null) {
    throw new Error("Despatch already saved");
  }

  const SaveDespatchQuery =
    "UPDATE Orders SET despatch_id = $1 WHERE order_id = $2";
  await pool.query(SaveDespatchQuery, [despatchId, orderId]);
}

export async function viewDespatches(
  buyerOrSellerId: number,
  BuyerOrSeller: string
) {
  console.log("in view function");
  if (!buyerOrSellerId || isNaN(buyerOrSellerId)) {
    throw new Error("Buyer or Seller ID is empty or invalid");
  }
  let DespatchListQuery: string;
  if (BuyerOrSeller === "seller") {
    console.log("inseller");
    DespatchListQuery = `SELECT o.order_id, o.order_date, b.b_name, o.o_status, p.p2_name, o.price, o.despatch_id, o.seller FROM Orders o 
        JOIN Productsv2 p ON o.product = p.p2_id
        JOIN buyers b ON o.buyer = b.b_id
        WHERE o.seller = $1 AND despatch_id IS NOT NULL
        ORDER BY o.order_id;`;
  } else {
    DespatchListQuery = `SELECT o.order_id, o.order_date, s.s_name, o.o_status, p.p2_name, o.price, o.despatch_id, o.buyer FROM Orders o 
        JOIN Productsv2 p ON o.product = p.p2_id
        JOIN sellers s ON o.seller = s.s_id
        WHERE o.buyer = $1 AND despatch_id IS NOT NULL
        ORDER BY o.order_id;`;
  }

  const DespatchListRes = await pool.query(DespatchListQuery, [
    buyerOrSellerId,
  ]);
  console.log("after view function");
  console.log(DespatchListRes.rows);
  return DespatchListRes.rows;
}

export async function getSellerFinanceStats(sellerId: number) {
  const sellerOrders = await pool.query(
    `SELECT o_status, order_date, price
         FROM orders
         WHERE seller = $1`,
    [sellerId]
  );

  const orders = sellerOrders.rows;

  const statusCounts: Record<string, number> = {
    PENDING_SELLER_REVIEW: 0,
    PENDING_BUYER_REVIEW: 0,
    ORDER_REGISTERED: 0,
    SELLER_ORDER_ACCEPTED: 0,
    SELLER_ORDER_REJECTED: 0,
    ORDER_CANCELLED: 0,
    ORDER_ACCEPTED: 0,
    ORDER_FULFILLED: 0,
  };

  const statusRevenue: Record<string, number> = {
    PENDING_SELLER_REVIEW: 0,
    PENDING_BUYER_REVIEW: 0,
    ORDER_REGISTERED: 0,
    SELLER_ORDER_ACCEPTED: 0,
    SELLER_ORDER_REJECTED: 0,
    ORDER_CANCELLED: 0,
    ORDER_ACCEPTED: 0,
    ORDER_FULFILLED: 0,
  };

  const customStatusOrder: Record<string, number> = {
    ORDER_FULFILLED: 1,
    ORDER_CANCELLED: 2,
    PENDING_BUYER_REVIEW: 3,
    PENDING_SELLER_REVIEW: 4,
    ORDER_ACCEPTED: 5,
    SELLER_ORDER_ACCEPTED: 6,
    ORDER_REGISTERED: 7,
    SELLER_ORDER_REJECTED: 8,
  };

  for (const { o_status, price } of orders) {
    if (statusCounts[o_status] !== undefined) {
      statusCounts[o_status]++;
      statusRevenue[o_status] += Number(price) || 0;
    }
  }

  const sortedOrders = orders
    .map((o) => ({
      status: o.o_status,
      date: new Date(o.order_date).toISOString().split("T")[0],
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
