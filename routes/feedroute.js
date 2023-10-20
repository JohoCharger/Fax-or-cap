const express = require('express');
const { GetTimeString } = require('./../Utils');

const router = express.Router();

module.exports = (params) => {
    const database = params.database;

    //feed route
    router.get("/", async (request, response) => {
        const posts = await database.getPosts(10);
        const now = Date.now();
        posts.forEach(post => {
            const post_date = Date.parse(post.created_at);
            const difference = now - post_date;
            post.time_since = GetTimeString(String(difference));
        });
        let profile = false;
        if (request.session.id) {
            const session = await database.getSessionBySessionId(request.session.id);
            if (session) {
                profile = await database.getAccountByGoogleId(session.account_id);
            }
        }
        return response.render("feed", { posts, profile });
    });

    router.get('/new_content', async (request, response) => {
        const amount = parseInt(request.query.amount) || 1;
        const posts = await database.getPosts(amount);
        const now = Date.now();
        posts.forEach(post => {
            const post_date = Date.parse(post.created_at);
            const difference = now - post_date;
            post.time_since = GetTimeString(String(difference));
        });

        return response.json(posts);
    });

    return router;
}