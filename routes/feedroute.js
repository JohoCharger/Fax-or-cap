const express = require('express');
const { GetTimeString } = require('./../Utils');

const router = express.Router();

module.exports = (params) => {
    const database = params.database;

    //feed route
    router.get("/", async (request, response) => {
        let profile = false;
        let posts = [];
        const session = await database.getSessionBySessionId(request.session.id);
        if (session) {
            posts = await database.getPostsAndVotesByAccount(session.account_id, 1);
            posts.forEach(post => {
                if (!post.vote_type) return;
                post.vote_type = post.vote_type.readUInt8(0);
            });
            profile = await database.getAccountByGoogleId(session.account_id);
        } else {
            request.session.id = null;
            posts = await database.getPosts(10);
        }
        const now = Date.now();
        posts.forEach(post => {
            const post_date = Date.parse(post.created_at);
            const difference = now - post_date;
            post.time_since = GetTimeString(String(difference));
        });
        let lastPost = 0
        if (posts.length > 0) lastPost = posts[posts.length - 1].post_id;

        return response.render("feed", { posts, profile, lastPost });
    });

    router.get('/new_content', async (request, response) => {
        const session = await database.getSessionBySessionId(request.session.id);
        const amount = parseInt(request.query.amount) || 1;
        const lastPost = parseInt(request.query.last_post) || 0;
        let posts = [];

        if (session) {
            posts = await database.getPostsAndVotesByAccount(session.account_id, amount, lastPost);
            posts.forEach(post => {
                if (!post.vote_type) return;
                post.vote_type = post.vote_type.readUInt8(0);
            });
        } else {
            request.session.id = null;
            posts = await database.getPosts(amount, lastPost);
        }

        const now = Date.now();
        posts.forEach(post => {
            const post_date = Date.parse(post.created_at);
            const difference = now - post_date;
            post.time_since = GetTimeString(String(difference));
        });

        return response.json(posts);
    });

    router.get('/new_content/:user/', async (request, response) => {
        const session = await database.getSessionBySessionId(request.session.id);
        const account = await database.getAccountByUsername(request.params.user);
        if (!account) return response.json([]);

        const amount = parseInt(request.query.amount) || 1;
        const lastPost = parseInt(request.query.last_post) || 0;
        let posts = [];

        if (session) {
            posts = await database.getAccountAndVotesPosts(session.account_id, account.google_id, amount, lastPost);
            posts.forEach(post => {
                if (!post.vote_type) return;
                post.vote_type = post.vote_type.readUInt8(0);
            });
        } else {
            request.session.id = null;
            posts = await database.getAccountPosts(account.google_id, amount, lastPost);
        }

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