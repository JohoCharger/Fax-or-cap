const mysql = require('mysql2');

require('dotenv').config();

class Database {
    constructor() {
        this.connection = null;
    }

    connect() {
        this.connection = mysql.createPool({
            host: '127.0.0.1',
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            database: 'faxorcap',
            connectionLimit: 10,
            maxIdle: 10,
        }).promise();

        console.log("Connection to database established");
    }

    async createNewPost(post) {
        await this.connection.query(
            "INSERT INTO posts(account_id, content) " +
            "VALUES (?, ?)",
            [post.account_id, post.content]
        );
    }

    async getAllPosts() {
        const result = await this.connection.query(
            "SELECT * FROM posts"
        );
        return result[0];
    }

    async getPosts(amount) {
        const result = await this.connection.query(
            "SELECT posts.account_id, content, created_at, accounts.username, accounts.img_link " +
            "FROM posts LEFT JOIN accounts ON posts.account_id = accounts.google_id " +
            "LIMIT ?"
        ,[amount]);
        return result[0];
    }

    async getPostsAndVotesByAccount(account_id, amount) {
        const result = await this.connection.query(
            "SELECT posts.post_id, posts.account_id, content, created_at, vote_type, accounts.img_link," +
            " accounts.username" +
            " FROM posts LEFT JOIN " +
            "(SELECT vote_type, account_id, post_id FROM votes WHERE account_id=?) as votes_1 " +
            "ON posts.account_id=votes_1.account_id AND posts.post_id=votes_1.post_id " +
            "LEFT JOIN accounts on accounts.google_id = posts.account_id " +
            "LIMIT ?",
            [account_id, amount]
        )
        return result[0];
    }

    async createNewSession(session_id, account_id) {
        await this.connection.execute(
            "INSERT INTO sessions(session_id, account_id) VALUES(?, ?)",
            [session_id, account_id]
        );
    }

    async getSessionBySessionId(session_id) {
        const results = await this.connection.query(
            "SELECT * FROM sessions WHERE session_id=?",
            [session_id]
        );
        return results[0][0];
    }

    async getSessionByAccountId(account_id) {
        const results = await this.connection.query(
            "SELECT * FROM sessions WHERE account_id=?",
            [account_id]
        );
        if (results) return results[0][0];
        return 0;
    }

    async removeSession(session_id) {
        await this.connection.execute(
            "DELETE FROM sessions WHERE session_id=?",
            [session_id]
        );
    }

    async updateSession(account_id, new_session_id) {
        await this.connection.execute(
            "UPDATE sessions SET session_id = ? WHERE account_id = ?",
            [new_session_id, account_id]
        )
    }

    async createNewAccount(creds) {
        await this.connection.execute(
            "INSERT INTO accounts(google_id, email, username, img_link) " +
            "VALUES(?, ?, ?, ?)",
            [creds.google_id, creds.email, creds.username, creds.img_link]
        )
    }

    async getAccountByGoogleId(google_id) {
        const results = await this.connection.query(
            "SELECT * FROM accounts WHERE google_id = ?",
            [google_id]
        );
        return results[0][0];
    }

    async getAccountUsername(google_id) {
        const results = await this.connection.query(
            "SELECT username FROM accounts WHERE google_id = ?",
            [google_id]
        );
        return results[0][0];
    }

    async getAccountByUsername(username) {
        const results = await this.connection.query(
            "SELECT * FROM accounts WHERE username = ?",
            [username]
        );
        return results[0][0];
    }

    async addVote(vote) {
        let previousVote = await this.connection.query(
            "SELECT vote_id FROM votes WHERE post_id=? AND account_id=?",
            [vote.post_id, vote.account_id]
        );

        if (previousVote[0][0]) {
            //Previous vote exists, update vote
            await this.connection.execute(
                "UPDATE votes SET vote_type = ? WHERE vote_id = ?",
                [vote.vote_type, previousVote[0][0].vote_id]
            );
        } else {
            await this.connection.execute(
                "INSERT INTO votes(post_id, account_id, vote_type) VALUES (?, ?, ?)",
                [vote.post_id, vote.account_id, vote.vote_type]
            );
        }
    }

    async getAccountAndVotesPosts(requester_account_id, requested_account_id, amount) {
        const result = await this.connection.query(
            "SELECT posts_1.post_id, posts_1.account_id, content, created_at, vote_type, accounts.img_link," +
            " accounts.username" +
            " FROM (SELECT * FROM posts WHERE account_id=?) as posts_1 LEFT JOIN " +
            "(SELECT vote_type, account_id, post_id FROM votes WHERE account_id=?) as votes_1 " +
            "ON posts_1.account_id=votes_1.account_id AND posts_1.post_id=votes_1.post_id " +
            "LEFT JOIN accounts on accounts.google_id = posts_1.account_id " +
            "LIMIT ?",
            [requested_account_id, requester_account_id, amount]
        )
        return result[0];
    }

    async getAccountPosts(account_id, amount) {
        const result = await this.connection.query(
            "SELECT posts.post_id, posts.account_id, content, created_at, accounts.img_link," +
            " accounts.username" +
            " FROM (SELECT * FROM posts WHERE account_id=?) as posts LEFT JOIN accounts ON " +
            "posts.account_id = accounts.google_id " +
            "LIMIT ?",
            [account_id, amount]
        )
        return result[0];
    }
}


module.exports = Database;