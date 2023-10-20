const uuid = require('uuid');
class SessionManager {
    constructor() {
        this.sessions = {};
    }

    newSession(account_id) {
        if (this.hasSession(account_id)) {
            throw new Error('Session already exists');
        } else {
            this.sessions[account_id] = uuid.v4();

            return this.sessions[account_id];
        }
    }

    removeSessionBySessionId(session_id) {
        const account_id = this.getSessionAccountId(session_id);
        if (!account_id) return;
        this.removeSessionByAccountId(account_id);
    }

    removeSessionByAccountId(account_id) {
        this.sessions[account_id] = null;
    }

    hasSession(account_id) {
        return account_id in this.sessions;
    }

    getSessionAccountId(session_id) {
        this.sessions.forEach(session => {
            if (session.session_id === session_id) {
                return session.account_id;
            }
        });
        return 0;
    }

    isValidSession(session_id) {
        for([account_id, session] of Object.entries(this.sessions)) {
            if (session.session_id === session_id) {
                return true;
            }
        }
        return false;
    }
}

module.exports = SessionManager;