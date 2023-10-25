const express = require('express');

const PostApiRouter = require('./postapiroute');
const VoteApiRouter = require('./voteapiroute');
const AccountApiRouter = require('./accountapiroute');
const FeedApiRouter = require('./feedapiroute');

const router = express.Router();

module.exports = (params) => {
    const database = params.database;

    router.use('/post', PostApiRouter({database}));
    router.use('/vote', VoteApiRouter({database}));
    router.use('/account', AccountApiRouter({database}));
    router.use('/feed', FeedApiRouter({database}));

    return router;
}
