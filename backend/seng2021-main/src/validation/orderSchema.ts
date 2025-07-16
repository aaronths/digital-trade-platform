import Joi from 'joi';

const orderSchema = Joi.object({
    price: Joi.number().integer().min(0).required(),
    paymentDetails: Joi.string().required(),
    quantity: Joi.number().integer().min(1).required(),
    deliveryAddress: Joi.string().required(),
    contractData: Joi.string().required(),
    // BUYER DETAILS
    buyerCompanyName: Joi.string().required(),
    buyerAddress: Joi.string().required(),
    buyerPhoneNumber: Joi.string().required(),
    buyerEmail: Joi.string().required(),
    buyerTax: Joi.string().required(),
    // SELLER DETAILS
    sellerCompanyName: Joi.string().required(),
    sellerAddress: Joi.string().required(),
    sellerPhoneNumber: Joi.string().required(),
    sellerEmail: Joi.string().required(),
    sellerTax: Joi.string().required(),
    // PRODUCT DETAILS
    productId: Joi.string().required(),
    productTax: Joi.string().required(),
    productDesc: Joi.string().required()
  });
  
  export default orderSchema;
  
