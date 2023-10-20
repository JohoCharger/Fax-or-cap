const mysql = require('mysql2');
require('dotenv').config();

class Database {
    constructor() {
        this.connection = null;
    }

    connect() {
        this.connection = mysql.createConnection({
            host: '127.0.0.1',
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            database: 'faxorcap'
        }).promise();

        console.log("Connection to database established");
    }

    async getAllPosts() {
        const result = await this.connection.query(
            "SELECT * FROM posts"
        );
        return result[0];
    }

    async getPosts(amount) {
        const result = await this.connection.query(
            "SELECT * FROM posts LIMIT ?"
        ,[amount]);
        return result[0];
    }

    async createPost(post){
        await this.connection.execute(
            "INSERT INTO posts(name, content) VALUES(?, ?)",
            [post.name, post.content]
        );
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
        if (results) return results[0][0];
        return 0;
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
}


module.exports = Database;