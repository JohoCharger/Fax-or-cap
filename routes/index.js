const express = require('express');
const FeedRouter = require('./feedroute');
const NewPostRouter = require('./postroute');
const AuthRouter = require('./authroute');
const VoteRouter = require('./voteroute');
const ProfileRouter = require('./profileroute');

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
    router.use('/post', NewPostRouter({database}));
    router.use('/vote', VoteRouter({database}));
    router.use('/profile', ProfileRouter({database}));

    return router;
}