const express = require('express');
const jwtDecode = require("jwt-decode");
const random = require("random-integer");
const uuid = require("uuid");
const {OAuth2Client} = require('google-auth-library');

const router = express.Router();

module.exports = (params) => {
    const database = params.database;

    router.post('/auth/google', async (request, response, next) => {
        try {
            if (request.session.id) {
                if (await database.getSessionBySessionId(request.session.id)) {
                    return response.redirect('/feed')
                }
            }
            const credential = jwtDecode(request.body.credential);
            const account_id = credential.sub;

            let new_account = false;
            const account = await database.getAccountByGoogleId(account_id);
            if (!account) {
                let username = '';
                do {
                    username = credential.given_name + String(random(100000, 999999));
                } while (await database.getAccountByUsername(username));

                const creds = {
                    google_id: account_id,
                    email: credential.email || 'No email?? how is this possible?',
                    username: username,
                    img_link: credential.picture || '/res/stock_profile_picture.png'
                }
                await database.createNewAccount(creds);
                request.session.new_account = true;
                new_account = true;
            } else {
                request.session.new_account = false;
            }
            const session_id = uuid.v4();

            if (await database.getSessionByAccountId(account_id)) {
                await database.updateSession(account_id, session_id);
            } else {
                await database.createNewSession(session_id, account_id);
            }

            request.session.id = session_id;
            if (new_account) return response.redirect('/auth/new_user');
            return response.redirect('/feed');
        } catch (error) {
            return next(error);
        }

    });


    router.get('/log_out', async (request, response, next) => {
        try {
            if (!request.session.id) response.redirect('/feed');
            await database.removeSession(request.session.id);
            request.session.id = null;
            return response.redirect('/feed');
        } catch (error) {
            return next(error);
        }
    });

    router.post('/stay_signed', (request, response, next) => {
        try {
            if (request.body.stay) {
                request.session.maxAge = request.sessionOptions.maxAge;
            } else if (!request.body.stay) {
                request.session.maxAge = 0;
            }
            return response.status(200).end();
        } catch (error) {
            return next(error);
        }
    });


    router.get('/username_available', async (request, response, next) => {
        try {
            const session = await database.getSessionBySessionId(request.session.id);
            if (!session) return response.redirect('/login');

            const username = request.query.username;

            const account = await database.getAccountByUsername(username);
            if (account) {
                return response.json({available: false});
            } else {
                return response.json({available: true});
            }
        } catch (error) {
            return next(error);
        }
    });

    const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const allowedSpecialChars = '!@#$%*_,./?-';
    const allowedChars = alphabet + numbers + allowedSpecialChars;

    router.post('/change_username', async (request, response, next) => {
        try {
            const session = await database.getSessionBySessionId(request.session.id);
            if (!session) return response.redirect('/login');

            const username = request.body.newUsername;
            const account = await database.getAccountByUsername(username);

            if (account) return response.status(400).send('lol no hacking');

            if (username.length < 3 || username.length > 20) return response.status(400).send('lol no hacking');
            for (let i = 0; i < username.length; i++) {
                if (!allowedChars.includes(username[i])) return response.status(400).send('lol no hacking');
            }

            await database.updateUsername(session.account_id, request.body.newUsername);

            return response.status(200).end();
        } catch (error) {
            return next(error);
        }
    });

    return router;
}