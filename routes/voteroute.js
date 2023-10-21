const express = require('express');

const router = express.Router();

module.exports = (params) => {
    const database = params.database;

    router.post('/add', async (request, response) => {
        const session = await database.getSessionBySessionId(request.session.id);

        if (!session) {
            request.session.id = null;
            return response.status(404).send('invalid session');
        }
        /*
        if (!request.body.type || !request.body.post_id) {
            return response.status(404);
        }*/

        await database.addVote({
            post_id: request.body.post_id,
            account_id: session.account_id,
            vote_type: parseInt(request.body.vote_type)
        });
        return response.status(200).end();
    });

    return router;
}