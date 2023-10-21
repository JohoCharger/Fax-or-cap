const express = require('express');
const FeedRouter = require('./feedroute');
const NewPostRouter = require('./newpostroute');
const AuthRouter = require('./authroute');
const VoteRouter = require('./voteroute');
const {PluggableAuthHandler} = require("google-auth-library/build/src/auth/pluggable-auth-handler");

const router = express.Router();

module.exports = (params) => {
    const database = params.database;

    router.get('/', (request, response) => {
       return response.redirect('/feed');
    });

    router.get('/profile', (request, response) => {
        response.render('profile');
    });

    //other routes
    router.use('/feed', FeedRouter({database}));
    router.use('/auth', AuthRouter({database}));
    router.use('/new_post', NewPostRouter({database}));
    router.use('/vote', VoteRouter({database}));

    return router;
}