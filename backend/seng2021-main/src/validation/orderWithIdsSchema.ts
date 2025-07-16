import Joi from 'joi';

const orderInfowithIds = Joi.object({
    price: Joi.number().integer().min(0).required(),
    paymentDetails: Joi.string().required(),
    quantity: Joi.number().integer().min(1).required(),
    deliveryAddress: Joi.string().required(),
    contractData: Joi.string().required(),
    buyerId: Joi.number().integer().required(),
    sellerId: Joi.number().integer().required(),
    // PRODUCT DETAILS
    productId: Joi.string().required(),
    productTax: Joi.string().required(),
    productDesc: Joi.string().required()
 });

 export default orderInfowithIds;
