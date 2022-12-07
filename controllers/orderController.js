const Order = require("../models/Order");
const Product = require("../models/Product");
const { StatusCodes } = require("http-status-codes");
const { checkPermissions } = require("../utils");
const CustomError = require("../errors");

const fakeStripeAPI = async ({ amount, currency }) => {
  const client_secret = "random_value";
  return { client_secret, amount };
};

const createOrder = async (req, res) => {
  const { items: cartItems, tax, shippingFee } = req.body;

  if (!cartItems || cartItems.length < 1) {
    throw new CustomError.BadRequestError("No items provided");
  }
  if (!tax || !shippingFee) {
    throw new CustomError.BadRequestError("Provide tax & shipping fee");
  }

  let orderItems = [];
  let subtotal = 0;

  //.map e .ForEach non funzionano con await, quindi:
  for (const item of cartItems) {
    const dbProduct = await Product.findOne({ _id: item.product });
    if (!dbProduct) {
      throw new CustomError.NotFoundError(`No product w/ id:${item.product}`);
    }
    const { name, price, image, _id } = dbProduct;
    const singleOrderItem = {
      amount: item.amount,
      name,
      price,
      image,
      product: _id,
    };
    // add item to order
    orderItems = [...orderItems, singleOrderItem];
    //calculate subtotal
    subtotal += item.amount * price;
  }
  //calculate total
  const total = tax + shippingFee + subtotal;
  //get client secret (fake stripe in this case)
  const paymentIntent = await fakeStripeAPI({
    amount: total,
    currency: "usd",
  });

  const order = await Order.create({
    orderItems,
    total,
    subtotal,
    tax,
    shippingFee,
    clientSecret: paymentIntent.client_secret,
    user: req.user.userId,
  });

  res
    .status(StatusCodes.CREATED)
    .json({ clientSecret: order.clientSecret, order });
};

//

const getAllOrders = async (req, res) => {
  const orders = await Order.find({}).populate({
    path: "user",
    select: "name",
  });
  res.status(StatusCodes.OK).json({ count: orders.length, orders });
};

//

const getSingleOrder = async (req, res) => {
  const { id: orderId } = req.params;
  const order = await Order.findOne({ _id: orderId }).populate({
    path: "user",
    select: "name",
  });
  if (!order) {
    throw new CustomError.NotFoundError(`No orders with id: ${orderId}`);
  }

  checkPermissions(req.user, order?.user?._id);
  res.status(StatusCodes.OK).json({ order });
};

//

const getCurrentUserOrder = async (req, res) => {
  const orders = await Order.find({
    user: req.user.userId,
  }).populate({
    path: "user",
    select: "name",
  });
  res.status(StatusCodes.OK).json({ count: orders.length, orders });
};

//

const updateOrder = async (req, res) => {
  const { id: orderId } = req.params;
  const { paymentIntentId } = req.body;

  const order = await Order.findOne({ _id: orderId }).populate({
    path: "user",
    select: "name",
  });
  if (!order) {
    throw new CustomError.NotFoundError(`No orders with id: ${orderId}`);
  }
  checkPermissions(req.user, order.user?._id);

  order.paymentIntentId = paymentIntentId;

  // paymenteStatus FAILED??
  //   if (!paymentIntentId) {
  //     order.status = "failed";
  //     await order.save();
  //   } else {
  //     order.status = "paid";
  //     await order.save();
  //   }

  order.status = "paid";
  await order.save();

  res
    .status(StatusCodes.OK)
    .json({ order, paymentIntentId: order.paymentIntentId });
};

module.exports = {
  createOrder,
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrder,
  updateOrder,
};
