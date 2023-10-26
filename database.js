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

    async removePost(post_id) {
        await this.connection.execute(
            "DELETE FROM posts WHERE post_id = ?",
            [post_id]
        );
    }

    async getPostByPostId(post_id) {
        const result = await this.connection.query(
            "SELECT * FROM posts WHERE post_id = ?",
            [post_id]
        );
        return result[0][0];
    }

    async getAllPosts() {
        const result = await this.connection.query(
            "SELECT * FROM posts"
        );
        return result[0];
    }

    async getPosts(amount, lastPost = 9999999) {
        const result = await this.connection.query(
            "SELECT posts.account_id, content, created_at, accounts.username, accounts.img_link, posts.post_id " +
            "FROM posts LEFT JOIN accounts ON posts.account_id = accounts.google_id " +
            "WHERE posts.post_id < ? ORDER BY posts.post_id DESC " +
            "LIMIT ?"
        ,[lastPost, amount]);
        return result[0];
    }

    async getPostsAndVotesByAccount(account_id, amount, lastPost = 9999999) {
        const result = await this.connection.query(
            "SELECT posts.post_id, votes_1.account_id, content, created_at, vote_type, accounts.img_link," +
            " accounts.username" +
            " FROM posts LEFT JOIN " +
            "(SELECT vote_type, account_id, post_id FROM votes WHERE account_id=?) as votes_1 " +
            "ON posts.post_id=votes_1.post_id " +
            "LEFT JOIN accounts on accounts.google_id = posts.account_id " +
            "WHERE posts.post_id < ? ORDER BY posts.post_id DESC " +
            "LIMIT ?",
            [account_id, lastPost, amount]
        );
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

    async getAccountByUsername(username) {
        const results = await this.connection.query(
            "SELECT * FROM accounts WHERE username = ?",
            [username]
        );
        return results[0][0];
    }

    async updateUsername(google_id, new_username) {
        await this.connection.execute(
            "UPDATE accounts SET username = ? WHERE google_id = ?",
            [new_username, google_id]
        )
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

    async getAccountAndVotesPosts(requester_account_id, requested_account_id, amount, lastPost = 9999999) {
        const result = await this.connection.query(
            "SELECT posts_1.post_id, posts_1.account_id, content, created_at, vote_type, accounts.img_link," +
            " accounts.username" +
            " FROM (SELECT * FROM posts WHERE account_id=?) as posts_1 LEFT JOIN " +
            "(SELECT vote_type, account_id, post_id FROM votes WHERE account_id=?) as votes_1 " +
            "ON posts_1.post_id=votes_1.post_id " +
            "LEFT JOIN accounts on accounts.google_id = posts_1.account_id " +
            "WHERE posts_1.post_id < ? ORDER BY posts_1.post_id DESC " +
            "LIMIT ?",
            [requested_account_id, requester_account_id, lastPost, amount]
        )
        return result[0];
    }

    async getAccountPosts(account_id, amount, lastPost = 9999999) {
        const result = await this.connection.query(
            "SELECT posts.post_id, posts.account_id, content, created_at, accounts.img_link," +
            " accounts.username" +
            " FROM (SELECT * FROM posts WHERE account_id=?) as posts LEFT JOIN accounts ON " +
            "posts.account_id = accounts.google_id " +
            "WHERE posts.post_id < ? ORDER BY posts.post_id DESC " +
            "LIMIT ?",
            [account_id, lastPost, amount]
        )
        return result[0];
    }

    async getPostCount(account_id) {
        const results = await this.connection.query(
            "SELECT COUNT(*) as count FROM posts WHERE account_id=?",
            [account_id]
        );
        return results[0][0].count;
    }

    async removeVote(vote){
        await this.connection.execute(
            "DELETE FROM votes WHERE post_id = ? AND account_id = ?",
            [vote.post_id, vote.account_id]
        )
    }

    async countVotes(post_id) {
        const cap_count = await this.connection.query(
            "SELECT COUNT(*) as cnt FROM votes WHERE post_id = ? AND vote_type = 0",
            [post_id]
        );
        const fax_count = await this.connection.query(
            "SELECT COUNT(*) as cnt FROM votes WHERE post_id = ? AND vote_type = 1",
            [post_id]
        )

        const results = {
            fax: fax_count[0][0] ? fax_count[0][0].cnt : 0,
            cap: cap_count[0][0] ? cap_count[0][0].cnt : 0
        }
        return results;
    }
    async countVotesTotal(post_id) {
        const count = await this.connection.query(
            "SELECT COUNT(*) as cnt FROM votes WHERE post_id = ?",
            [post_id]
        );
        return count[0][0].cnt;
    }
}


module.exports = Database;