const express = require('express');
const jwtDecode = require("jwt-decode");
const uuid = require("uuid");

const router = express.Router();

module.exports = (params) => {
    const database = params.database;

    router.get('/sign_in', (request, response) => {
        response.render('signin');
    });

    router.post('/google', async (request, response) => {
        if (request.session.id) {
            if (await database.getSessionBySessionId(request.session.id)) {
                return response.redirect('/feed')
            }
        }
        const credential = jwtDecode(request.body.credential);
        const account_id = credential.sub;

        const account = await database.getAccountByGoogleId(account_id);
        if (!account) {
            const creds = {
                google_id: account_id,
                email: credential.email,
                username: credential.given_name,
                img_link: credential.picture
            }
            await database.createNewAccount(creds);
        }
        const session_id = uuid.v4();

        if (await database.getSessionByAccountId(account_id)){
            await database.updateSession(account_id, session_id);
        } else {
            await database.createNewSession(session_id, account_id);
        }
        request.session.id = session_id;
        return response.redirect('/feed');
    });


    router.get('/log_out', async (request, response) => {
        if (!request.session.id) response.redirect('/feed');
        await database.removeSession(request.session.id);
        request.session.id = null;
        return response.redirect('/feed');
    });


    return router;
}