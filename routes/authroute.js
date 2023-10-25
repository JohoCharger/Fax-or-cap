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

    router.post('/google', async (request, response) => {
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
    });


    router.get('/log_out', async (request, response) => {
        if (!request.session.id) response.redirect('/feed');
        await database.removeSession(request.session.id);
        request.session.id = null;
        return response.redirect('/feed');
    });

    router.post('/stay_signed', (request, response) => {
        if (request.body.stay) {
            request.session.maxAge = request.sessionOptions.maxAge;
        } else if (!request.body.stay) {
            request.session.maxAge = 0;
        }
        return response.status(200).end();
    });

    router.get('/new_user', async (request, response) => {
        const session = await database.getSessionBySessionId(request.session.id);
        if (session) {
            if (request.session.new_account) {
                const account = await database.getAccountByGoogleId(session.account_id);
                request.session.new_account = false;
                return response.render('change_username', {account, newAccount: true});
            }
        }
        return response.redirect('/feed');
    });

    router.get('/change_username', async (request, response) => {
        const session = await database.getSessionBySessionId(request.session.id);
        if (session) {
            const account = await database.getAccountByGoogleId(session.account_id);
            request.session.new_account = false;
            return response.render('change_username', {account, newAccount: false});
        }
        return response.redirect('/feed');
    });

    router.get('/username_available', async (request, response) => {
        const session = await database.getSessionBySessionId(request.session.id);
        if (!session) return response.redirect('/login');

        const username = request.query.username;

        const account = await database.getAccountByUsername(username);
        if (account) {
            return response.json({available: false});
        } else {
            return response.json({available: true});
        }
    });

    router.post('/change_username', async (request, response) => {
        const session = await database.getSessionBySessionId(request.session.id);
        if (!session) return response.redirect('/login');

        await database.updateUsername(session.account_id, request.body.newUsername);

        return response.status(200).end();
    })


    return router;
}