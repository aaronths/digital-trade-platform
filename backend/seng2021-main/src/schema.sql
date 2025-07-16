CREATE DATABASE ordercreation;

CREATE DOMAIN order_status AS VARCHAR(30)
    CHECK (VALUE IN (
    'PENDING_SELLER_REVIEW',
    'ORDER_REJECTED',
    'SELLER_ORDER_ACCEPTED',
    'PENDING_BUYER_REVIEW',
    'ORDER_CANCELLED',
    'ORDER_ACCEPTED',
    'ORDER_REGISTERED',
    'ORDER_FULFILLED'));
    
CREATE TABLE IF NOT EXISTS Buyers (
    b_id SERIAL PRIMARY KEY,
    b_name varchar(40),
    b_address varchar(100),
    b_phone_no varchar(40),
    b_email varchar(40),
    b_tax varchar(40)
);

ALTER TABLE buyers
ADD CONSTRAINT unique_buyer_info UNIQUE (b_name, b_address, b_phone_no, b_email, b_tax);

CREATE TABLE IF NOT EXISTS Sellers (
    s_id SERIAL PRIMARY KEY,
    s_name varchar(40),
    s_address varchar(100),
    s_phone_no varchar(40),
    s_email varchar(40),
    s_tax varchar(40)
);

ALTER TABLE sellers
ADD CONSTRAINT unique_seller_info UNIQUE (s_name, s_address, s_phone_no, s_email, s_tax);

CREATE TABLE IF NOT EXISTS Products (
    p_id integer,
    p_tax varchar(40),
    p_desc varchar(1000),
    PRIMARY KEY (p_id)
);

ALTER TABLE products
ADD CONSTRAINT unique_product_info UNIQUE (p_id, p_tax, p_desc);

CREATE TABLE IF NOT EXISTS Orders (
    order_id SERIAL PRIMARY KEY,
    order_date date,
    price integer,
    payment_details varchar(100),
    quantity integer,
    delivery_address varchar(100),
    contract_data text,
    response text,
    details text,
    o_status order_status DEFAULT 'PENDING_SELLER_REVIEW',
    buyer integer,
    seller integer,
    product integer,
    
    FOREIGN KEY (buyer) references Buyers(b_id),
    FOREIGN KEY (seller) references Sellers(s_id),
    FOREIGN KEY (product) references products(p_id)
);

CREATE TABLE IF NOT EXISTS ProductsV2 (
    p2_id SERIAL PRIMARY KEY,
    p2_name varchar(100),
    p2_price integer,
    p2_tax varchar(100),
    p2_desc varchar(1000),
    seller_id integer
);

CREATE TABLE IF NOT EXISTS MESSAGES (
    message_id SERIAL PRIMARY KEY,
    sender_email varchar(40) NOT NULL,
    reciever_email varchar(40) NOT NULL,
    content TEXT NOT NULL,
    timestamp timestamp DEFAULT CURRENT_TIMESTAMP
);

ADD CONSTRAINT unique_product_v2_info UNIQUE (p2_name, p2_price, p2_tax, p2_desc, seller_id);