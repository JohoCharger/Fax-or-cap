const express = require('express');
const {GetTimeString} = require("../Utils");

const router = express.Router();

module.exports = (params) => {
    const database = params.database;

   router.get('/:user', async (request, response) => {
       const account = await database.getAccountByUsername(request.params.user);

       if (!account) return response.status(404).send('<h1>Invalid user</h1>');

       let profile = false;
       let posts = [];
       const session = await database.getSessionBySessionId(request.session.id);
       if (session) {
           posts = await database.getAccountAndVotesPosts(session.account_id, account.google_id, 10);
           posts.forEach(post => {
               if (!post.vote_type) return;
               post.vote_type = post.vote_type.readUInt8(0);
           });
           profile = await database.getAccountByGoogleId(session.account_id);
       } else {
           request.session.id = null;
           posts = await database.getAccountPosts(account.google_id, 10);
       }

       const now = Date.now();
       posts.forEach(post => {
           const post_date = Date.parse(post.created_at);
           const difference = now - post_date;
           post.time_since = GetTimeString(String(difference));
       });

       let lastPost = 0;
       if (posts.length > 0) lastPost = posts[posts.length - 1].post_id;

       return response.render('profile', { posts, profile, account, lastPost });
   });

    return router;
}