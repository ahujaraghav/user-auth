const mongoose = require('mongoose')
const validator = require('validator')
const { errorMessages } = require('../config/errorMessages')
const bcrypt = require('bcrypt')
const _ = require('lodash')
const useragent = require('useragent')
const authenticator = require('authenticator');
const jwt = require('jsonwebtoken')

const Schema = mongoose.Schema

const userSchema = new Schema({
    email: {
        type: String,
        required: [true, errorMessages.emailRequired],
        unique: true,
        validate: {
            validator: (email) => {
                return validator.isEmail(email)
            },
            message: errorMessages.emailInvalid
        }
    },
    mobile: {
        type: Number,
        required: [true, errorMessages.mobileRequired],
        unique: true,
        validate: {
            validator: (mobile) => {
                return validator.isMobilePhone(mobile.toString())
            },
            message: errorMessages.mobileInvalid
        }
    },
    password: {
        type: String,
        required: [true, errorMessages.passwordRequired]
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    browserFingerprint: [{
        ip: String,
        date: {
            type: Date,
            default: Date.now
        },
        os: String,
        'os-version': String,
        agent: String,
        'agent-version': String,
        device: String
    }],
    loginActivity: [{
        ip: String,
        date: {
            type: Date,
            default: Date.now
        },
        token: String
    }],
    mfa: {
        key: String,
        uri: String,
        on: {
            type: Boolean,
            default: false
        }
    },
    mfaToken: {
        type: String
    }
})


userSchema.pre('save', function (next) {
    const user = this
    if (!user.isNew) {
        next()
    }

    bcrypt.genSalt(10)
        .then(salt => bcrypt.hash(user.password, salt))
        .then(encryptedPassword => {
            user.password = encryptedPassword
            user.mfa.key = authenticator.generateKey()
            user.mfa.uri = authenticator.generateTotpUri(user.mfa.key, user.email, "user-auth", 'SHA1', 6, 30)
            const token = user.generateToken()
            user.tokens.push({ token })
            next()
        })
        .catch((err) => {
          
            const error = new Error()
            error.name = 'ServerError'
            error.message = 'Internal Server Error'
            error.code = 6048
            next(error)
        })
})



userSchema.statics.verifyMfa = function (token, otp, fingerprint) {
    const User = this
    const tokenData = jwt.verify(token, 'secret123')

    return User.findOne({ email: tokenData.email })
        .then((user) => {
            if (user.mfaToken == token) {
                if (user.generateMfaOtp() == otp) {
                    const token = user.generateToken()
                    
                    user.browserFingerprint.push(fingerprint)
                    user.tokens.push({ token })
                    user.mfaToken = undefined
                    return user.save()
                        .then(() => {
                            return Promise.resolve({token, mfa: user.mfa.uri})
                        })
                        .catch((err) => {
                            return Promise.reject()
                        })
                }
                else {
                    return Promise.reject('invalid otp')
                }
            } else {
                return Promise.reject('forbidden')
            }
        })
        .catch(() => {
            return Promise.reject('forbidden')
        })
}

userSchema.statics.checkAllCredentials = function (fieldProvided, user, password, fingerprint) {
    const User = this
    return User.checkLoginCredentials(fieldProvided, user, password)
        .then((user) => {
            const found = user.browserFingerprint.find((fingerprintAllowed) => {
                const fa = _.pick(fingerprintAllowed, ['os', 'os-version', 'agent', 'agent-version', 'device'])
                const fc = _.pick(fingerprint, ['os', 'os-version', 'agent', 'agent-version', 'device'])
                if (JSON.stringify(fa) == JSON.stringify(fc)) {
                    return true
                }
            })

            if (user.mfa.on) {
                if (!found) {
                    const token = user.generateToken(true)
                    user.mfaToken = token
                    return user.save()
                        .then(() => {
                            return Promise.resolve({ mfaRequired: true, token })
                        })
                }
            } else {
                if (!found) {
                    user.browserFingerprint.push(fingerprint)
                }
            }

            const token = user.generateToken()
            user.tokens.push({ token })
            user.mfaToken = undefined

            return user.save()
                .then((user) => {
                    const res = _.pick(user, ['email', 'mobile', 'role', 'mfa'])
                    res.mfa = res.mfa.uri
                    res.token = token
                    return Promise.resolve(res)
                })
        })
        .catch((err) => {
            return Promise.reject()
        })
}

userSchema.statics.checkLoginCredentials = function (fieldProvided, user, password) {
    const User = this
    return User.findOne({ [fieldProvided]: user })
        .then((user) => {
            if (!user) {
                return Promise.reject()
            }
            else {
                return bcrypt.compare(password, user.password)
                    .then((match) => {
                        if (match) {
                            return Promise.resolve(user)
                        } else {
                            return Promise.reject()
                        }
                    })
                    .catch(() => Promise.reject())
            }
        })
}

userSchema.methods.generateToken = function (mfaToken) {
    const user = this
    const tokenData = {
        email: user.email,
        role: user.role,
        date: Date.now()
    }
    if (mfaToken) {
        tokenData.mfaToken = true
    }
    const token = jwt.sign(tokenData, 'secret123')
    return token
}

userSchema.methods.generateMfaOtp = function () {
    const formattedKey = this.mfa.key;
    const formattedToken = authenticator.generateToken(formattedKey);
    return formattedToken
}

// userSchema.statics.verifyToken = function (token) {
//     const User = this
//     const tokenData = jwt.verify(token, 'secret123')
//     return User.findOne({ email: tokenData.email })
//         .then((user) => {
//             const found = user.tokens.find((tok) => {
//                 return tok.token = token
//             })
//             if (found) {
//                 return Promise.resolve(user)
//             }
//         })
// }



const User = mongoose.model('User', userSchema)
module.exports = {
    User
}