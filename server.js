const express = require('express');
const path = require('path');
const bodyParser = require("body-parser");
const helmet = require('helmet');
const cookieSession = require('cookie-session');
const jwtDecode = require('jwt-decode');
const uuid = require('uuid');
const routes = require("./routes/index");

const Database = require("./database");

const app = express();
const database = new Database();
const port = process.env.PORT || 3000;

app.use(helmet({
    referrerPolicy: { policy: 'no-referrer-when-downgrade' },
    contentSecurityPolicy: {
        directives: {
            'script-src': ["'self'", 'https://accounts.google.com/gsi/client'],
            'img-src': ["'self'", 'https://lh3.googleusercontent.com/']
        }
    }
}));

app.use(cookieSession({
    name: 'session',
    keys: ['fdjvnbklbasdapoi7353gnfds', '543097623gnjfdsbnda2vnat4p35', 'hdfakllbkbalkhry2u5y901f'],
    maxAge: 7 * 24 * 60 * 60 * 1000
}))

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set("views", path.join(__dirname, "./views"))
app.set("view engine", "ejs");
app.set("trust proxy", 1);

app.use(routes({ database }));

app.use(express.static('static/'));
app.use("/bootstrap", express.static("node_modules/bootstrap/"));
app.use("/bootstrap-icons", express.static("node_modules/bootstrap-icons/font/"));


database.connect();

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
