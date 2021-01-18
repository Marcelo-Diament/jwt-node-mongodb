const express = require('express')
const bodyParser = require('body-parser')

const app = express()
require('dotenv').config()
const port = process.env.PORT || 5000

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

require('./controllers/auth')(app)
require('./controllers/orders')(app)

app.get('/', (req, res) => res.send('<h1>Node + Express + MongoDB Auth</h1>'))

app.listen(port, () => console.log(`Servidor rodando na porta ${port}`))