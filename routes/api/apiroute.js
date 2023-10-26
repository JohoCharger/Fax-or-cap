const express = require('express');

const PostApiRouter = require('./postapi');
const VoteApiRouter = require('./voteapi');
const AccountApiRouter = require('./accountapi');
const FeedApiRouter = require('./feedapi');

const router = express.Router();

module.exports = (params) => {
    const database = params.database;

    router.use('/post', PostApiRouter({database}));
    router.use('/vote', VoteApiRouter({database}));
    router.use('/account', AccountApiRouter({database}));
    router.use('/feed', FeedApiRouter({database}));

    return router;
}
