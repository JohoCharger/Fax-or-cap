const express = require('express');

const router = express.Router();

module.exports = (params) => {
    const database = params.database;

    router.post('/add', async (request, response, next) => {
        try {
            const session = await database.getSessionBySessionId(request.session.id);

            if (!session) {
                request.session.id = null;
                return response.status(404).send('invalid session');
            }
            /*
            if (!request.body.type || !request.body.post_id) {
                return response.status(404);
            }*/
            let vote_type = parseInt(request.body.vote_type);
            if (vote_type !== 0 && vote_type !== 1) {
                return response.status(404).send('invalid vote type');
            }

            await database.addVote({
                post_id: request.body.post_id,
                account_id: session.account_id,
                vote_type: vote_type
            });
            return response.status(200).end();
        } catch (error) {
            return next(error)
        }

    });

    router.delete('/remove', async function(request, response, next) {
        try {
            const session = await database.getSessionBySessionId(request.session.id);
            if (!session) return response.status(403).send('lol wtf');

            const post_id = request.body.post_id;
            const account_id = session.account_id;

            await database.removeVote( { post_id, account_id } );
            return response.status(200).end();
        } catch (error) {
            return next(error);
        }
    });

    return router;
}