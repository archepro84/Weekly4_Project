const express = require("express");
const Joi = require("joi");
const {Users, Posts, Comments} = require("../models");
const {Op} = require("sequelize");
const jwt = require("jsonwebtoken");
const mysql = require("mysql");
const path = require("path")

const router = express.Router();
const authMiddleware = require("../middlewares/auth_middleware");
const connection = require("../assets/mySqlLib")


router.get('/:postId', async (req, res) => {
    //TODO 자기자신의 userId는 어떠한 방식으로 알 수 있을까?
    const postId = req.params.postId;
    const post = await Posts.findByPk(postId)
        .then((posts) => {
            return posts['dataValues']
        });


    res.render("post",{post})
});


module.exports = router