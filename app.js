const express = require('express')
const app = express()
const cors = require('cors')

const {userRouter} = require('./app/controllers/UserController')
app.use(express.json())
app.use(cors())

app.use('/users', userRouter)

module.exports = {
    app
}
