const express = require('express');
const path = require("path");

const router = express.Router();

module.exports = (params) => {
    const database = params.database;

    router.get('/create', (request, response) => {
        response.render("post");
    });

    router.post('/submit', (request, response) => {
        database.createPost(request.body);
        response.redirect("../");
    })

    return router;
}