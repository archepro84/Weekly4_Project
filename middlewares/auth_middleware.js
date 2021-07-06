const jwt = require("jsonwebtoken");
const {Users} = require("../models");

module.exports = (req, res, next) => {
    const {authorization} = req.headers;
    const [tokenType, tokenValue] = authorization.split(' ');
    if (tokenType !== 'Bearer') {
        res.status(401).send({
            errorMessage: "로그인 후 사용하세요.",
        });
        return;
    }
    try {
        const {userId} = jwt.verify(tokenValue, "weekly4_Project_key");
        // console.log(userId);
        //promise
        Users.findByPk(userId)
            .then((user) => {
                res.locals.user = user;
                //Promise 이므로 next를 사용하여 다음 미들웨어로 넘긴다.
                next();
            });
    } catch (err) {
        res.status(401).send({
            errorMessage: "로그인 후 사용하세요.",
        });
        return;
    }
}