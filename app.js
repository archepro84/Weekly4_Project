const express = require("express")
const Http = require("http");
const socketIo = require("socket.io");
const {Op} = require("sequelize");
const jwt = require("jsonwebtoken");
const {Users, Posts, Comments} = require("./models");
const Joi = require("joi");
const path = require("path")

const app = express();
const http = Http.createServer(app);
const router = express.Router();

const userSchema = Joi.object({
    nickname: Joi.string().required(),
    password: Joi.string().required(),
    confirm: Joi.string(),
})

router.post('/sign', async (req, res) => {
    try {
        //시작과 끝이 a-zA-Z0-9글자로 3 ~ 255개의 단어로 구성되어야 한다.
        const re_nickname = /^[a-zA-Z0-9]{3,255}$/;
        const re_password = /^[a-zA-Z0-9]{4,255}$/;

        const {nickname, password, confirm} = await userSchema.validateAsync(req.body)
        // console.log(nickname, password, confirm);

        if (password !== confirm) {
            res.status(412).send({
                errorMessage: "패스워드가 일치하지 않습니다."
            });
            return;
        }
        if (nickname.search(re_nickname) == -1) {
            res.status(412).send({
                errorMessage: "ID의 형식이 일치하지 않습니다."
            });
            return;
        }
        if (password.search(re_password) == -1) {
            res.status(412).send({
                errorMessage: "패스워드 형식이 일치하지 않습니다."
            });
            return;
        }
        if (password.search(nickname) != -1) {
            res.status(412).send({
                errorMessage: "패스워드에 닉네임이 포함되어 있습니다."
            });
            return;
        }


        const user = await Users.findAll({
            where: {nickname}
            // [Op.or]: [{nickname}],
        })

        if (user.length) {
            res.status(412).send({
                errorMessage: "중복된 닉네임입니다."
            });
            return;
        }
        //CreateAt 과 UpdateAt을 지정해주지 않아도 자동으로 값이 입력된다.
        await Users.create({nickname, password})
        console.log(`${nickname} 님이 가입하셨습니다.`);
        res.status(200).send({result: "Clear"})
    } catch (err) {
        res.status(400).send({
            errorMessage: '요청한 데이터 형식이 올바르지 않습니다.',
        });
    }
});

const loginSchema = Joi.object({
    nickname: Joi.string().required(),
    password: Joi.string().required(),
})

router.post('/login', async (req, res) => {
    try {
        const {nickname, password} = await loginSchema.validateAsync(req.body);

        const user = await Users.findAll({
            where: {
                [Op.and]: [{nickname}, {password}]
            }
        })
        if (user.length == 0) {
            res.status(412).send({
                errorMessage: "닉네임 또는 패스워드를 확인해주세요"
            });
            return;
        }

        res.send({result: "/api/login success"})
    } catch (err) {
        res.status(400).send({
            errorMessage: '요청한 데이터 형식이 올바르지 않습니다.',
        });
    }
});

router.post('/posts', async (req, res) => {
    // TODO 만약 DB가 커져 더많은 데이터를 가지고 있을경우, 과부화를 어떻게 줄일 수 있을까?
    // TODO 
    const posts = await Posts.findAll();
    console.log(posts);

    res.send({posts})
});


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/assets/login.html'))
});

// app.get('/login', (req, res) => {
//     res.sendFile(path.join(__dirname, '/assets/login.html'))
// });

app.get('/sign', (req, res) => {
    res.sendFile(path.join(__dirname, '/assets/sign.html'))
});

app.get('/post', (req, res) => {
    res.sendFile(path.join(__dirname, '/assets/post.html'))
});

app.use("/api", express.urlencoded({extended: false}), router);
app.use(express.static("assets"));


http.listen(4911, () => {
    console.log(`Start listen Server `);
});