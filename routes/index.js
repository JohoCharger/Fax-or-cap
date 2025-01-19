const express = require('express');
const AuthRouter = require('./authroute');
const ProfileRouter = require('./profileroute');
const ApiRouter = require('./api/apiroute');

const {PluggableAuthHandler} = require("google-auth-library/build/src/auth/pluggable-auth-handler");

const router = express.Router();

module.exports = (params) => {
    const database = params.database;

    router.get('/', (request, response) => {
       return response.redirect('/feed');
    });

    router.get('/ylikellotus', (request, response) => {
        return response.render('ylikellotus');
    });

    router.get("/feed", async (request, response, next) => {
        try {
            let profile = false;

            const session = await database.getSessionBySessionId(request.session.id);
            if (session) profile = await database.getAccountByGoogleId(session.account_id);
            else request.session.id = null;

            return response.render("feed", { profile });
        } catch (error) {
            return next(error)
        }
    });

    //other routes
    router.use('/api', ApiRouter({database}));
    router.use('/auth', AuthRouter({database}));
    router.use('/profile', ProfileRouter({database}));

    //404
    router.use((request, response) => {
        const error = {
            status: 404,
            message: 'The page you requested does not exist'
        }
        return response.render('error', { error });
    });

    return router;
}