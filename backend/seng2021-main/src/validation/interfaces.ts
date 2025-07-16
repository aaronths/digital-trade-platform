export interface BuyerDetails {
  buyerCompanyName: string;
  buyerAddress: string;
  buyerPhoneNumber: string;
  buyerTax: string;
  buyerEmail: string;
}

export interface SellerDetails {
  sellerCompanyName: string;
  sellerAddress: string;
  sellerPhoneNumber: string;
  sellerTax: string;
  sellerEmail: string;
}

export interface ProductDetails {
  productId: string;
  productDesc: string;
  price: number; // integer, min 0
  quantity: number; // integer, min 1
  productTaxDetails: string;
}

export interface OrderInfo {
  price: string;
  paymentDetails: string;
  quantity: string;
  deliveryAddress: string;
  contractData: string;
  // BUYER DETAILS
  buyerCompanyName: string;
  buyerAddress: string;
  buyerPhoneNumber: string;
  buyerEmail: string;
  buyerTax: string;
  // SELLER DETAILS
  sellerCompanyName: string;
  sellerAddress: string;
  sellerPhoneNumber: string;
  sellerEmail: string;
  sellerTax: string;
  // PRODUCT DETAILS
  productId: string;
  productTax: string;
  productDesc: string;
}


export interface InfoWithIds {
    price: string;
    paymentDetails: string;
    quantity: string;
    deliveryAddress: string;
    contractData: string;
    buyerId: string;
    sellerId: string;
    // PRODUCT DETAILS
    productId: string;
    productTax: string;
    productDesc: string;
}