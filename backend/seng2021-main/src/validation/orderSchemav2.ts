import Joi from 'joi';

const orderSchemav2 = Joi.object({
    productId: Joi.number().integer().required(),
    buyerId: Joi.number().integer().required(),
    sellerId: Joi.number().integer().required(),
    quantity: Joi.number().integer().min(1).required(),
    contractData: Joi.string().required(),
    paymentDetails: Joi.string().required(),
    deliveryAddress: Joi.string().required()
  });
export default orderSchemav2;