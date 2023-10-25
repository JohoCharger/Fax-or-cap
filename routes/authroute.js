const express = require('express');
const jwtDecode = require("jwt-decode");
const uuid = require("uuid");
const random = require('random-integer');

require('dotenv').config();

const router = express.Router();

module.exports = (params) => {
    const database = params.database;

    router.get('/sign_in', (request, response) => {
        response.render('signin', { authUri: process.env.AUTH_URI } );
    });

    router.get('/new_user', async (request, response, next) => {
        try {
            const session = await database.getSessionBySessionId(request.session.id);
            if (session) {
                if (request.session.new_account) {
                    const account = await database.getAccountByGoogleId(session.account_id);
                    request.session.new_account = false;
                    return response.render('change_username', {account, newAccount: true});
                }
            }
            return response.redirect('/feed');
        } catch (error) {
            return next(error);
        }
    });

    router.get('/change_username', async (request, response, next) => {
        try {
            const session = await database.getSessionBySessionId(request.session.id);
            if (session) {
                const account = await database.getAccountByGoogleId(session.account_id);
                request.session.new_account = false;
                return response.render('change_username', {account, newAccount: false});
            }
            return response.redirect('/feed');
        } catch (error) {
            return next(error);
        }
    });

    return router;
}