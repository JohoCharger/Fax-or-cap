--TABLES
CREATE TABLE accounts
(
    account_id INT PRIMARY KEY AUTO_INCREMENT,
    google_id VARCHAR(255) UNIQUE NOT NULL,
    email varchar(255) UNIQUE NOT NULL,
    username varchar(30) UNIQUE NOT NULL,
    img_link varchar(255) NOT NULL
);

CREATE TABLE sessions
(
    session_id VARCHAR(255) PRIMARY KEY NOT NULL,
    account_id VARCHAR(255) UNIQUE NOT NULL,
    FOREIGN KEY (account_id) REFERENCES accounts(google_id) ON DELETE CASCADE
);

CREATE TABLE posts
(
    post_id INTEGER PRIMARY KEY AUTO_INCREMENT,
    account_id VARCHAR(255) NOT NULL,
    content VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT NOW(),
    FOREIGN KEY (account_id) REFERENCES accounts(google_id) ON DELETE CASCADE
);

CREATE TABLE votes
(
    vote_id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT NOT NULL,
    account_id VARCHAR(255) NOT NULL,
    vote_type BIT(1) NOT NULL,
    FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES accounts(google_id) ON DELETE CASCADE
);

--SHOW
SELECT * FROM accounts;
SELECT * FROM sessions;
SELECT * FROM posts;
SELECT * FROM votes;

--DELETE ALL
DELETE FROM accounts;
DELETE FROM sessions;
DELETE FROM posts;
DELETE FROM votes;

--DROP TABLE
DROP TABLE accounts;
DROP TABLE sessions;
DROP TABLE posts;
DROP TABLE votes;


--OTHER MISC COMMANDS
SELECT username, img_link FROM sessions INNER JOIN accounts
ON sessions.account_id = accounts.google_id;

SELECT * FROM posts LEFT JOIN
(SELECT vote_type, account_id, post_id FROM votes WHERE account_id='111451191372340224263') as votes_1
ON posts.account_id=votes_1.account_id AND posts.post_id=votes_1.post_id LIMIT 10;

SELECT votes.vote_type FROM votes INNER JOIN posts ON votes.post_id = posts.post_id WHERE posts.account_id =
'111451191372340224263'
(SELECT * FROM posts WHERE account_id = '111451191372340224263') as posts_1