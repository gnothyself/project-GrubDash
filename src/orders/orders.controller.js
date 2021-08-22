const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

function orderExists(req, res, next) {
    const { orderId } = req.params;
    const foundOrder  = orders.find((order) => order.id === orderId);
    if (foundOrder) {
        res.locals.order = foundOrder;
        next();
    };
    next({ status: 404, message: `Order id not found: ${ orderId }`})
};

function orderHasCorrectProps(req, res, next) {
    const { data: { deliverTo, mobileNumber, dishes, quantity }} = req.body;
    if (!deliverTo || deliverTo == "")
        return next({ status: 400, message: `Order must include a deliverTo`});
    if (!mobileNumber || mobileNumber == "")
        return next({ status: 400, message: `Order must include a mobileNumber`});
    if (!dishes) 
        return next({ status: 400, message: `Order must include a dish`});
    if (dishes !== Array || dishes == [])
        return next({ status: 400, message: `Order must include at least one dish`});
    if (!quantity)
        return next({ status: 400, message: `Dish ${index} must have a quantity that is an integer greater than 0`});
    if (quantity !== "number" || quantity <= 0)
        return next({ status: 400, message: `Dish ${index} must have a quantity that is an integer greater than 0`});
    next();
}

function list(req, res){
    res.json({ data: orders });
};

function create(req, res) {
    const { data: { deliverTo, mobileNumber, dishes, quantity }} = req.body;
    const newOrder = {
        id: nextId(),
        deliverTo: deliverTo,
        mobileNumber: mobileNumber,
        dishes: dishes, 
        quantity: quantity
    }
    orders.push(newOrder)
    res.status(201).json({ data: newOrder });
};

function read(req, res) {
    res.json({ data: res.locals.order });

};

function update(req, res, next) {
    const { orderId } = req.params;
    let originalOrder = res.locals.order;
    const { data: { deliverTo, mobileNumber, status, dishes, quantity }} = req.body;

    if (id && id !== orderId)
        next({ status: 400, message: `Order id does not match route id. Order: ${id}, Route: ${orderId}.`});
    if (!status || status == "")
        next({ status: 400, message: `Order must have a status of pending, preparing, out-for-delivery, delivered`});
    if (status === "delivered")
        next({ status: 400, message: `A delivered order cannot be changed`});
    
    originalOrder = {
        id: originalOrder.id,
        deliverTo: deliverTo,
        mobileNumber: mobileNumber,
        status: status,
        dishes: dishes,
        quantity: quantity
    };

    res.json({ data: originalOrder });
};

function destroy(req, res, next) {
    const { orderId } = req.params;
    if (res.locals.order.status !== "pending")
        next({ status: 400, message: `An order cannot be deleted unless it is pending`});
    
    const index = orders.findIndex((order) => order.id === orderId);
    if (index  > -1) orders.splice(index, 1);
    res.status(204)
};

module.exports = {
    list,
    create: [orderHasCorrectProps, create],
    read: [orderExists, read],
    update: [orderExists, orderHasCorrectProps, update],
    delete: [orderExists, destroy]
};