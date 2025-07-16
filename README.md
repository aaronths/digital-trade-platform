# Digital Trade Platform

## Overview

This project is a digital trade platform for managing orders, buyers, sellers, and products, with advanced features such as despatch advice and invoice creation. It is built with a modern tech stack and is designed for extensibility and integration with external systems.

---

## Functionality

- **Order Management:** Create, update, and track orders between buyers and sellers.
- **User Management:** Register and authenticate buyers and sellers.
- **Product Management:** Add, update, and delete products.
- **Despatch Advice Creation:** Generate despatch advice for orders.  
  _Note: This feature relies on an external API (`https://sbu6etysvc.execute-api.us-east-1.amazonaws.com/v2/despatch`). It may not always be available or functional depending on the status of the external service._
- **Invoice Creation:** Generate invoices for completed orders.  
  _Note: This feature relies on an external API (`http://guard-ubl-api.us-east-1.elasticbeanstalk.com/api/invoices/generate`). It may not always be available or functional depending on the status of the external service._
- **Messaging:** Send and receive messages between users.
- **API Documentation:** Swagger documentation is available for all endpoints.

---

## Deployment

- **Frontend:** [https://notuna-frontend.vercel.app](https://notuna-frontend.vercel.app)
- **Backend API:** [https://seng2021-notuna-order.vercel.app](https://seng2021-notuna-order.vercel.app)

---

## Tech Stack

### Backend

- **Language:** TypeScript (Node.js)
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM/Query:** `pg` (node-postgres)
- **Validation:** Joi
- **Authentication:** JWT, API Key
- **Other:** dotenv, bcrypt, swagger-ui-express

### Frontend

- **Language:** TypeScript
- **Framework:** React
- **Build Tool:** Vite

---

## Authentication

All API routes require an API key in the request header:

- **Header:** `authorization`
- **Value:** _CONTACT FOR VALUE_

---

## API Documentation

- Swagger/OpenAPI documentation is available at `/api-docs` on the backend deployment.

---

## Notes

- Some advanced features (despatch advice and invoice creation) depend on third-party APIs. If those services are down or unreachable, these features may not work as expected.
- For a visual overview of the order workflow, see the included state diagram in the backend README.
