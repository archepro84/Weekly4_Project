const express = require("express")
const Http = require("http");
const socketIo = require("socket.io");
const path = require("path")
const router = require("./routers/router");
const router_post = require("./routers/router_post")
const router_comment = require("./routers/router_comment")
const nunjucks = require("nunjucks");

const app = express();
const http = Http.createServer(app);

app.set('view engine', 'html');
nunjucks.configure('views', {
    express: app,
    watch: true,
})


app.get('/', (req, res) => {

    // res.sendFile(path.join(__dirname, '/assets/board.html'))
    res.render("board")
});

app.get('/login', (req, res) => {
    // res.sendFile(path.join(__dirname, '/assets/login.html'))
    res.render("login")
});

app.get('/sign', (req, res) => {
    // res.sendFile(path.join(__dirname, '/assets/sign.html'))
    res.render("sign")
});

app.get('/write', (req, res) => {
    // res.sendFile(path.join(__dirname, '/assets/write.html'))
    res.render("write")
});
app.get('/hello', (req, res) => {
    res.render("hello")
});

app.use("/api", express.urlencoded({extended: false}), router);
app.use("/post", express.urlencoded({extended: false}), router_post);
app.use("/comment", express.urlencoded({extended: false}), router_comment)
app.use(express.static("assets"));

http.listen(4911, () => {
    console.log(`Start listen Server `);
});