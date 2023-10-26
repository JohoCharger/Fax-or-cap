const express = require('express');
const {getFaxOrCapString, getTimeString} = require("../../Utils");

const router = express.Router();

module.exports = (params) => {
    const database = params.database;

    router.post('/create', async (request, response, next) => {
        try {
            const session = await database.getSessionBySessionId(request.session.id);

            if (session) {
                const content = request.body.content;
                if (content.trim() === '') return response.redirect("../")
                if (content.length > 250) return response.redirect("../");

                await database.createNewPost({
                    account_id: session.account_id,
                    content: request.body.content
                });
                return response.redirect("../");
            }

            return response.redirect("../");
        } catch (error) {
            return next(error)
        }
    });

    router.delete('/remove', async (request, response, next) => {
        try {
            const session = await database.getSessionBySessionId(request.session.id);

            if (!session) return response.status(402).send('yo wtf');
            const post_id = request.body.post_id;
            const post = await database.getPostByPostId(post_id);

            if (post) {
                if (post.account_id === session.account_id) {
                    await database.removePost(post_id);
                    return response.status(200).end();
                }
            }
            return response.status(402).send('yo wtf');
        } catch (error) {
            return next(error);
        }
    });

    return router;
}
