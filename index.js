require('./app/config/database')
const express = require('express')
const {app} = require('./app')
const path = require('path')

// Step - 1
const port =  process.env.PORT || 3005

// Step - 3
if(process.env.NODE_ENV === 'production'){
    app.use(express.static('client/build'))
    app.use('*',(req, res)=>{
        res.sendFile(path.join(__dirname, '../client', 'build', 'index.html'))
    })
}


app.listen(port,()=>{
    console.log(`!! successfully started node server on port ${port} !!`)
})