CREATE TABLE posts
(
    post_id INTEGER PRIMARY KEY AUTO_INCREMENT,
    account_id VARCHAR(255) NOT NULL,
    content VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT NOW(),
    FOREIGN KEY (account_id) REFERENCES accounts(google_id)
)

--insert sample values to posts table
INSERT INTO posts(name, content)
VALUES('Joonas', 'Cereal before milk'),
('Roope', 'Pineapple belongs to pizza'),
('Timi', 'McDonalds is better than BurgerKing'),
('Max', 'cuts are overrated'),
('Karen', 'if you work out, you are fatphobic'),
('Arvi', 'valorant is better than cs'),
('Elias', 'Gambling is good'),
('Joonas', 'I am bigger than Elias'),
('Max', 'you dont need to do something productive all the time'),
('Pave', 'I will beat Joonas at chess any time'),
('GothamChess', 'playing sicilian under 2000 elo is bad');

--show posts
SELECT * FROM posts;

--delete all posts
DELETE FROM posts;

DROP TABLE posts;

--created_at column
ALTER TABLE posts ADD created_at DATETIME DEFAULT NOW();

ALTER TABLE posts DROP INDEX account_id;

--sessions STUFF
USE faxorcap;

CREATE TABLE sessions
(
    session_id VARCHAR(255) PRIMARY KEY NOT NULL,
    account_id VARCHAR(255) UNIQUE NOT NULL,
    FOREIGN KEY (account_id) REFERENCES accounts(google_id)
);

-- Show sessions
SELECT * FROM sessions;

--Delete all sessions
DELETE FROM sessions;

--Users stuff

CREATE TABLE accounts
(
    account_id INT PRIMARY KEY AUTO_INCREMENT,
    google_id VARCHAR(255) UNIQUE NOT NULL,
    email varchar(255) UNIQUE NOT NULL,
    username varchar(30) UNIQUE NOT NULL,
    imglink varchar(255) NOT NULL
);

--Show accounts
SELECT * FROM accounts;

ALTER TABLE sessions ADD CONSTRAINT FOREIGN KEY(account_id) REFERENCES accounts(google_id);

ALTER TABLE accounts RENAME COLUMN imglink TO img_link;

DELETE FROM accounts;

SELECT username, img_link FROM sessions INNER JOIN accounts
ON sessions.account_id = accounts.google_id;

--votes stuff
CREATE TABLE votes
(
    vote_id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT NOT NULL,
    account_id VARCHAR(255) NOT NULL,
    type BIT(1) NOT NULL,
    FOREIGN KEY (post_id) REFERENCES posts(post_id),
    FOREIGN KEY (account_id) REFERENCES accounts(google_id)
)

SELECT * FROM votes;

DELETE FROM votes;

DROP TABLE votes;

ALTER TABLE votes RENAME COLUMN type TO vote_type;

SELECT *
FROM posts LEFT JOIN
(SELECT vote_type, account_id, post_id FROM votes WHERE account_id='111451191372340224263') as votes_1
ON posts.account_id=votes_1.account_id AND posts.post_id=votes_1.post_id LIMIT 10;