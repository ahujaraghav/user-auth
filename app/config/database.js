const mongoose = require('mongoose')

// Step - 2
const url = process.env.MONGODB_URI || "mongodb://localhost:27017/user-auth"

mongoose.Promise = global.Promise

mongoose.connect(url, { useNewUrlParser: true })
    .then(() => {
        console.log("!! successfully connected to development db user-auth !!")
    })
    .catch((err) => {
        console.log(err)
        console.log("!! error connecting to development db !!")
    })

module.exports = {
    mongoose
}