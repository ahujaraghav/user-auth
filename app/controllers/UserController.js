const express = require('express')
const router = express.Router()
const _ = require('lodash')
const { errorMessages } = require('../config/errorMessages')
const validator = require('validator')

const { User } = require('../models/User')
const { authenticateUser } = require('../middlewares/authenticateUser')
const {createFingerprint} = require('../middlewares/createFingerprint')

/**  handling /users  */

// Getting user info, only mfa status and email is passed.
// x-auth token has to be provided
router.get('/', authenticateUser, (req, res, next) => {
    const user = req.user
    res.send({ mfa: user.mfa.on, email: user.email })
})


// Allowing a user to change it's mfa status
// x-auth token is required
router.put('/mfa', authenticateUser, (req, res, next) => {
    const user = req.user
    user.mfa.on = req.body.mfa
    user.save()
        .then((user) => {
            res.send({ mfa: user.mfa })
        })
        .catch((err)=>{
            console.log(err)
        })
})

// user creation, first x-auth is generated, browser fingerprint is not registered.
router.post('/', (req, res, next) => {
    const body = _.pick(req.body, ['email', 'mobile', 'password'])
    const user = new User(body)
    user.save()
        .then((savedUser) => {
            const token = savedUser.tokens[0]
            res.status(200).send({ token: token.token, mfa: user.mfa.uri })
        })
        .catch((err) => {
            let error = { error: {} }
            // handling error in hasing password
            if (err.name == 'ServerError') {
                error.error.server = {
                    message: err.message,
                    'error-code': err.code
                }
                res.status(500).send(err.serverError)
            }
            // handling mongo duplicate value error
            else if (err.name === 'MongoError' && err.code == '11000') {
                const errorIn = err.message.split('index: ')[1].split('_')[0]
                error.error[errorIn] = errorMessages[errorIn + 'Unique']
                res.status(422).send(error)
            }
            // handling mongoose errors
            else {
                for (let key in err.errors) {
                    error.error[key] = err.errors[key].message
                }
                res.status(422).send(error)
            }
        })
})


// User login
router.post('/login', createFingerprint, (req, res, next) => {
    const body = _.pick(req.body, ['user', 'password'])
    if (!body.user || !body.password) {
        const error = { error: {} }
        if (!body.user) {
            error.error.user = 'Email/Mobile is required'
        }
        if (!body.password) {
            error.error.password = 'Password is required'
        }
        res.status(422).send(error)
    }
    else {
        const fieldProvided = validator.isEmail(body.user) ? 'email'
            : validator.isMobilePhone(body.user) ? 'mobile' : undefined

        if (fieldProvided) {
            User.checkAllCredentials(fieldProvided, body.user, body.password, req.fingerprint)
                .then((user) => {
                    res.send(user)
                })
                .catch((err) => {
                    res.status(401).send({ error: { credentials: `Invalid details, enter a valid ${fieldProvided} and password` } })
                })
        } else {
            res.status(401).send({ error: { user: 'Enter a valid email/mobile' } })
        }
    }
})

router.post('/login/multi-auth', createFingerprint, (req, res, next) => {
    const { otp } = req.body
    const token = req.header('otp-auth')

    // console.log(body, token)

    User.verifyMfa(token, otp, req.fingerprint)
        .then((data) => {
            res.send({token: data.token, mfa: data.mfa})
        })
        .catch((err) => {
            res.status(401).send(err)
        })
})

module.exports = {
    userRouter: router
}
