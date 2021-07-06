const express = require("express");
const Joi = require("joi");
const {Users, Posts, Comments} = require("../models");
const {Op} = require("sequelize");
const jwt = require("jsonwebtoken");
const mysql = require("mysql");
const path = require("path")

const router = express.Router();
const authMiddleware = require("../middlewares/auth_middleware");
const connection = require("../assets/mySqlLib");


router.get('/:postId', async (req, res) => {
    const userId_join = `SELECT c.userId, u.nickname, c.comment, c.createdAt, c.updatedAt
    FROM Comments AS c
    JOIN Users AS u
    ON c.userId = u.userId
    Order By c.postId ASC`;

    connection.query(userId_join, function (error, comments, fields) {
        if (error) {
            console.log(error);
            res.status(400).send({
                    errorMessage:"Comments 값들이 존재하지 않습니다."
                }
            )
            return;
        }
        console.log(comments);
        res.send({comments})
    });
});


module.exports = router