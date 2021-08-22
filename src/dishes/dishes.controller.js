const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

function dishExists(req, res, next) {
    const { dishId } = req.params;
    const foundDish = dishes.find((dish) => dish.id === dishId);
    if (foundDish) {
        res.locals.dish = foundDish;
        return next();
    }
    next({
        status: 400,
        messag: `Dish id not found: ${ dishId }`
    });
};

function dishHasCorrectProps(req, res, next) {
    const { data: { name, description, price, image_url } } = req.body
    if (!name || name == "")
        return next({
            status: 400,
            message: `Dish must include a name`
        });
    if (!description || description == "")
        return next({
            status: 404,
            message: `Dish must include a description`
        });
    if (!price)
        return next({ 
            status: 400,
            message: `Dish must include a price`
        });
    if (typeof price !== "number" || price <= 0)
        return next({
            status: 400,
            message: `Dish must have a price that is an integer greater than 0`
        });
    if (!image_url || image_url === "")
        return next({
            status: 400,
            message: `Dish must include a image_url`
        });
    next();
};

function create(req, res) {
    const { data: { name, description, price, img } = {} } = req.body;
    const newDish = {
        id: nextId(),
        name: name,
        description: description,
        price: price,
        image_url: img
    }
    dishes.push(newDish);
    res.status(201).json({ data: newDish });
};

function read(req, res) {
    res.json({ data: res.locals.dish });
};

function update(req, res, next) {
    const originalDish = res.locals.dish;
    const { data: { id, name, description, price, image_url }} = req.body;

    if (id && id !== req.params.dishId)
    return next({
      status: 400,
      message: `Dish id ${id} does not match dish id ${req.params.dishId}`,
    });

    originalDish = {
        id: originalDish.id,
        name: name,
        description: description,
        price: price,
        image_url: image_url
    };

    res.json({ data: originalDish })
}

function list(req, res) {
    res.json({ data: dishes });
};

module.exports = {
    create: [dishHasCorrectProps, create],
    list,
    read: [dishExists, read],
    update: [dishExists, dishHasCorrectProps, update] ,
};