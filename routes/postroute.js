const express = require('express');
const path = require("path");

const router = express.Router();

module.exports = (params) => {
    const database = params.database;

    router.post('/submit', async (request, response) => {
        const session = await database.getSessionBySessionId(request.session.id);

        if (session) {
            await database.createNewPost({
                account_id: session.account_id,
                content: request.body.content
            });
            return response.redirect("../");
        }

        return response.redirect("../");
    });

    router.delete('/remove', async (request, response) => {
        const session = await database.getSessionBySessionId(request.session.id);

        if (!session) return response.status(402).send('yo wtf');
        const post_id = request.body.post_id;
        const account_id = request.session.id;

        await database.removePost(post_id);
        return response.status(200).end();
    });

    return router;
}