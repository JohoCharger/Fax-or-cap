const express = require('express');
const path = require("path");

const router = express.Router();

module.exports = (params) => {
    const database = params.database;

    router.post('/submit', async (request, response) => {

        if (request.session.id) {
            const session = await database.getSessionBySessionId(request.session.id);
            if (session) {
                await database.createNewPost({
                    account_id: session.account_id,
                    content: request.body.content
                });
                return response.redirect("../");
            }
        }
        return response.redirect("../");
    })

    return router;
}