const express = require('express')
const router = express.Router()

router.get('/', async (req, res) => res.send({ ok: true, userId: req.userId }))

module.exports = app => app.use('/orders', router)