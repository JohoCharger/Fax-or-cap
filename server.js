const express = require('express');
const path = require('path');
const bodyParser = require("body-parser");
const helmet = require('helmet');
const cookieSession = require('cookie-session');
const cookieParser = require('cookie-parser');
const routes = require("./routes/index");

const Database = require("./database");

const app = express();
const database = new Database();
const port = process.env.PORT || 3000;

app.set("views", path.join(__dirname, "./views"))
app.set("view engine", "ejs");
app.set("trust proxy", 1);

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
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
}));

app.use(cookieParser());

app.use(function (request, response, next) {
    request.sessionOptions.maxAge = request.session.maxAge || request.sessionOptions.maxAge
    next()
})

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static('static/'));
app.use("/bootstrap", express.static("node_modules/bootstrap/"));
app.use("/bootstrap-icons", express.static("node_modules/bootstrap-icons/font/"));

app.use(routes({ database }));

//error handling
app.use((error, request, response, next) => {
    console.log(error);
    const status = error.status || 500;
    const message = error.message || 'Internal Server Error';
    return response.status(status).render('error', { error: { status, message } });
});

database.connect();

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
