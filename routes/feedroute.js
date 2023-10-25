const express = require('express');
const { getTimeString, getFaxOrCapString } = require('../Utils');

const router = express.Router();

module.exports = (params) => {
    const database = params.database;

    //feed route
    router.get("/", async (request, response) => {
        let profile = false;

        const session = await database.getSessionBySessionId(request.session.id);
        if (session) profile = await database.getAccountByGoogleId(session.account_id);
        else request.session.id = null;

        return response.render("feed", { profile });
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
        for (let i = 0; i < posts.length; i++) {
            const stats = await database.countVotes(posts[i].post_id);
            posts[i].fax = stats.fax;
            posts[i].cap = stats.cap;
            posts[i].faxorcapString = getFaxOrCapString(posts[i]);
            const post_date = Date.parse(posts[i].created_at);
            const difference = now - post_date;
            posts[i].time_since = getTimeString(String(difference));
        }

        return response.json(posts);
    });

    router.get('/new_content/:user/', async (request, response) => {
        const session = await database.getSessionBySessionId(request.session.id);
        const account = await database.getAccountByUsername(request.params.user);
        if (!account) return response.json([]);

        const amount = parseInt(request.query.amount) || 1;
        const lastPost = parseInt(request.query.last_post) || 0;
        let posts;

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
        for (let i = 0; i < posts.length; i++) {
            const stats = await database.countVotes(posts[i].post_id);
            posts[i].fax = stats.fax;
            posts[i].cap = stats.cap;
            posts[i].faxorcapString = getFaxOrCapString(posts[i]);
            const post_date = Date.parse(posts[i].created_at);
            const difference = now - post_date;
            posts[i].time_since = getTimeString(String(difference));
        }

        return response.json(posts);
    });

    return router;
}