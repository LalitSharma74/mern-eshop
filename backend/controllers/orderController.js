const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

// & ------------------> Creating a new Order --->
exports.newOrder = catchAsyncErrors(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    ItemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  const order = await Order.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    ItemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paidAt: Date.now(),
    user: req.user._id,
  });

  res.status(201).json({
    success: true,
    order,
  });
});

//&-----------------------> Get single Order  --ADMIN----------------->

//// .populate will populate the user ID with the name and email address of the user that has ordered by navigating to the user ID in user database therefore instead of getting user ID we will get email and name of the user that placed an order

exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!order) {
    return next(new ErrorHandler("Order not found with the id", 404));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

// ~ ---------------> Get logged in user Orders ---------->

exports.myOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id }); // filtering the logged in user ID  with the user ID in the user field in database

  res.status(200).json({
    success: true,
    orders,
  });
});

// &------------------->Get all orders -- ADMIN

exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find();
  let totalAmount = 0;

  // It will get total amount of orders just for admin purpose to show on the dashboard

  orders.forEach((order) => (totalAmount += order.totalPrice));

  res.status(200).json({
    success: true,
    totalAmount,
    orders,
  });
});

// &------------------>  Update order status --ADMIN

exports.updateOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id); // filtering the logged in user ID  with the user ID in the user field in database
  if (!order) {
    new ErrorHandler("Order not found with this id", 404);
  }
  if (order.orderStatus === "Delivered") {
    return next(new ErrorHandler("You have already delivered this order", 400));
  }

  // Now passing product id and quantity of order in updateStock to update order

  order.orderItems.forEach(async (o) => {
    await updateStock(o.product, o.quantity);
  });

  order.orderStatus = req.body.status;

  if (req.body.status === "Delivered") {
    order.deliveredAt = Date.now();
  }

  await order.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

// --------> updateStock Function ----->
async function updateStock(id, quantity) {
  const product = await Product.findById(id);
  product.stock -= quantity;
  product.save({ validateBeforeSave: false });
}

//&-----------> Delete Order -----ADMIN
exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    new ErrorHandler("Order not found with this id", 404);
  }
  await order.remove();

  res.status(200).json({
    success: true,
  });
});
