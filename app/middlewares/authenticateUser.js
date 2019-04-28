const { User } = require('../models/User')

const jwt = require('jsonwebtoken')

function authenticateUser(req, res, next) {
    const token = req.header('x-auth')
    const tokenData = jwt.verify(token, 'secret123')
    User.findOne({ email: tokenData.email })
        .then((user) => {
            const found = user.tokens.find((tok) => {
                return tok.token = token
            })
            if (found) {
                req.user = user
                next()
            }
            else {
                res.send('err')
            }
        })
        .catch(() => {
            res.send('err')
        })
}

module.exports = {
    authenticateUser
}