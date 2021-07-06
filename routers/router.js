const express = require("express");
const Joi = require("joi");
const {Users, Posts, Comments} = require("../models");
const {Op} = require("sequelize");
const jwt = require("jsonwebtoken");
const connection = require("../assets/mySqlLib");

const router = express.Router();
const authMiddleware = require("../middlewares/auth_middleware");


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

        const user = await Users.findOne({
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
        // console.log(user.userId);
        const token = jwt.sign({userId: user.userId}, "weekly4_Project_key")
        // console.log(token);
        res.send({token})

        // res.send({result: "/api/login success"})
    } catch (err) {
        res.status(400).send({
            errorMessage: '요청한 데이터 형식이 올바르지 않습니다.',
        });
    }
});

router.get('/posts', async (req, res) => {
    // // 앞에 10개는 받환받지 않고 넘긴 뒤 2개의 항목만 반환한다.
    // Project.findAll({ offset: 10, limit: 2 })

    const userId_join = `SELECT p.postId, p.userId, u.nickname, p.title, p.content, p.createdAt, p.updatedAt
    FROM Posts AS p
    JOIN Users AS u
    ON p.userId = u.userId
    Order By p.postId DESC`;

    connection.query(userId_join, function (error, posts, fields) {
        if (error) {
            console.log(error);
            res.status(400).send({
                    errorMessage: "Posts 값들이 존재하지 않습니다."
                }
            )
            return;
        }
        res.send({posts})

    });
});

router.post('/write/post', authMiddleware, async (req, res) => {
    const {title, content} = req.body;
    const {userId} = res.locals.user

    await Posts.create({userId, title, content})
    res.send({result: "성공적이였습니다."})
});

router.get('/users/me', async (req, res) => {
    // console.log(res.locals);
    const {user} = res.locals;
    res.send(
        user,
    )
});

router.post('/write/comment/:postId', authMiddleware, async (req, res) => {
    const {postId} = req.params;
    const {comment} = req.body;
    const {userId} = res.locals.user
    console.log(postId, comment, userId);


    if (!comment) {
        res.status(400).send({
            errorMessage: '요청한 데이터 형식이 올바르지 않습니다.',
        });
        return;
    }

    await Comments.create({postId, userId, comment});
    res.send("Clear")
});

router.get('/comment/:postId', async (req, res) => {
    const userId_join = `SELECT c.commentId,c.userId, u.nickname, c.comment, c.createdAt, c.updatedAt
    FROM Comments AS c
    JOIN Users AS u
    ON c.userId = u.userId
    Order By c.createdAt ASC`;

    connection.query(userId_join, function (error, comments, fields) {
        if (error) {
            console.log(error);
            res.status(400).send({
                    errorMessage: "Comments 값들이 존재하지 않습니다."
                }
            )
            return;
        }
        console.log(comments);
        res.send({comments})
    });
});
module.exports = router;