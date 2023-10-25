const express = require('express');
const { getFaxOrCapPercentage } = require("../Utils");

const router = express.Router();

module.exports = (params) => {
    const database = params.database;

    router.get('/:user', async (request, response, next) => {
        try {
            const account = await database.getAccountByUsername(request.params.user);

            if (!account) return response.status(404).send('<h1>Invalid user</h1>');

            let profile = false;
            const session = await database.getSessionBySessionId(request.session.id);
            if (session) {
                profile = await database.getAccountByGoogleId(session.account_id);
            } else {
                request.session.id = null;
            }

            const postCount = await database.getPostCount(account.google_id);
            const posts = await database.getAccountPosts(account.google_id, postCount);
            account.stats = {
                postCount: postCount,
                fax: 0,
                cap: 0,
            }
            for (let i = 0; i < posts.length; i++) {
                const result = await database.countVotes(posts[i].post_id);
                account.stats.fax += result.fax;
                account.stats.cap += result.cap;
            }
            account.stats.foc = getFaxOrCapPercentage(account.stats);

            return response.render('profile', {profile, account});
        } catch (error) {
            return next(error);
        }
    });

    return router;
}